const { db } = require('../service/firebaseService');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const OTP_EXPIRY_MINUTES = 5;

const generateTokens = (uid, email) => {
  const accessToken = jwt.sign(
    { uid, email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '15m' },
  );
  const refreshToken = jwt.sign(
    { uid },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' },
  );
  return { accessToken, refreshToken };
};

const normalizeEmail = email => email?.trim()?.toLowerCase() || '';
const normalizePhone = phone => `${phone || ''}`.replace(/[^\d]/g, '');
const makeOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const otpRef = db.collection('authOtps');
let smtpTransporter = null;

const getIdentifier = ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) return { key: `email:${normalizedEmail}`, type: 'email', value: normalizedEmail };
  return null;
};

const getSmtpTransporter = () => {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return smtpTransporter;
};

exports.verifySmtpOnStartup = async () => {
  const transporter = getSmtpTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!transporter || !from) {
    console.warn(
      '[SMTP] Skipped: missing SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM',
    );
    return;
  }

  try {
    await transporter.verify();
    console.log('[SMTP] Connection verified successfully.');
  } catch (error) {
    console.error(
      '[SMTP] Verification failed:',
      error?.message || 'Unknown SMTP error',
    );
  }
};

const sendOtpOutOfBand = async ({ type, value, otp }) => {
  if (type === 'email') {
    const transporter = getSmtpTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    if (transporter && from) {
      try {
        await transporter.sendMail({
          from,
          to: value,
          subject: 'Your OTP Code',
          text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
          html: `<p>Your OTP is <b>${otp}</b>.</p><p>It expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
        });
        return true;
      } catch (error) {
        error.otpDeliveryType = 'email';
        throw error;
      }
    }
  }

  // Fallback: keep logs for dev/testing or phone SMS provider pending wiring.
  console.log(`[OTP][${type}] ${value}: ${otp}`);
  return true;
};

const findUserByEmail = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail) {
    const byEmail = await db
      .collection('users')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    if (!byEmail.empty) return byEmail.docs[0];
  }

  return null;
};

const isFirebaseAuthzError = error => {
  const code = error?.code;
  const details = `${error?.details || ''}`.toLowerCase();
  const msg = `${error?.message || ''}`.toLowerCase();
  return (
    code === 16 ||
    details.includes('invalid authentication credentials') ||
    msg.includes('unauthenticated')
  );
};

// Login (request OTP by email)
exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    const identifier = getIdentifier({ email });
    if (!identifier) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      const userDoc = await findUserByEmail({ email });
      if (!userDoc) {
        return res.status(404).json({
          message: 'User not registered. Please register first.',
          shouldRegister: true,
          prefill: {
            email: normalizeEmail(email) || undefined,
          },
        });
      }

      const otp = makeOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await otpRef.doc(identifier.key).set(
        {
          otp,
          uid: userDoc.id,
          type: identifier.type,
          value: identifier.value,
          expiresAt,
          attempts: 0,
          createdAt: new Date(),
        },
        { merge: true },
      );

      await sendOtpOutOfBand({
        type: identifier.type,
        value: identifier.value,
        otp,
      });

      return res.json({
        message: `OTP sent to your ${identifier.type}.`,
      });
    } catch (error) {
      console.error('OTP Send Error:', error?.message || error);
      if (isFirebaseAuthzError(error)) {
        return res.status(500).json({
          message:
            'Server Firebase credentials invalid. Refresh service account key and Firestore IAM permissions.',
        });
      }
      if (error?.otpDeliveryType === 'email') {
        return res.status(500).json({
          message:
            'Failed to send email OTP. Check SMTP_USER, SMTP_PASS (Gmail App Password), and SMTP_FROM.',
        });
      }
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Login failed' });
  }
};

// Verify OTP and issue app tokens
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const identifier = getIdentifier({ email });
    if (!identifier || !otp) {
      return res
        .status(400)
        .json({ message: 'Email and OTP are required' });
    }

    const otpDoc = await otpRef.doc(identifier.key).get();
    if (!otpDoc.exists) {
      return res.status(400).json({ message: 'OTP not requested or expired' });
    }

    const otpData = otpDoc.data() || {};
    const now = Date.now();
    const expiryMs = otpData.expiresAt?.toDate
      ? otpData.expiresAt.toDate().getTime()
      : new Date(otpData.expiresAt || 0).getTime();
    if (!expiryMs || now > expiryMs) {
      await otpRef.doc(identifier.key).delete();
      return res.status(400).json({ message: 'OTP expired. Request again.' });
    }

    if (`${otpData.otp || ''}` !== `${otp}`) {
      await otpRef.doc(identifier.key).set(
        { attempts: (otpData.attempts || 0) + 1 },
        { merge: true },
      );
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    const userDoc = await db.collection('users').doc(otpData.uid).get();
    if (!userDoc.exists) {
      return res.status(401).json({
        message: 'User not found. Please register first.',
      });
    }

    const userData = userDoc.data() || {};
    const { accessToken, refreshToken } = generateTokens(
      userDoc.id,
      userData.email,
    );

    await otpRef.doc(identifier.key).delete();
    return res.json({
      user: {
        uid: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(400).json({ message: 'OTP verification failed' });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, phone, firstName, lastName } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    const normalizedFirstName = firstName?.trim();
    const normalizedLastName = lastName?.trim();
    if (
      !normalizedEmail ||
      !normalizedPhone ||
      !normalizedFirstName ||
      !normalizedLastName
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    try {
      // Firestore is the source-of-truth for "registered" users.
      const existingUserSnap = await db
        .collection('users')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();
      if (!existingUserSnap.empty) {
        return res.status(409).json({
          message: 'Email already registered. Please login.',
        });
      }
      const existingPhoneSnap = await db
        .collection('users')
        .where('phone', '==', normalizedPhone)
        .limit(1)
        .get();
      if (!existingPhoneSnap.empty) {
        return res.status(409).json({
          message: 'Phone already registered. Please login.',
        });
      }

      const uid = db.collection('users').doc().id;

      await db.collection('users').doc(uid).set({
        uid,
        email: normalizedEmail,
        phone: normalizedPhone,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ message: 'Account created. Please login with OTP.' });
    } catch (error) {
      console.error('Firebase Register Error:', error);
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    res.status(400).json({ message: 'Registration failed' });
  }
};

// Refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken required' });
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    );
    const { uid } = decoded;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    if (!userDoc.exists || !userData) {
      return res.status(403).json({
        message: 'User not found in database. Please register again.',
      });
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      uid,
      userData.email,
    );
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Logout (client-side token clear)
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
