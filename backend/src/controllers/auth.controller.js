// Firebase references kept for migration history:
// const { db } = require('../service/firebaseService');
// const admin = require('firebase-admin');
const User = require('../models/user.model');
const AuthOtp = require('../models/authOtp.model');
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
const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const INVALID_SERIES_PHONES = new Set([
  '0123456789',
  '1234567890',
  '9876543210',
  '0000000000',
  '1111111111',
  '2222222222',
  '3333333333',
  '4444444444',
  '5555555555',
  '6666666666',
  '7777777777',
  '8888888888',
  '9999999999',
]);
const makeOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
let smtpTransporter = null;

const getIdentifier = ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail)
    return {
      key: `email:${normalizedEmail}`,
      type: 'email',
      value: normalizedEmail,
    };
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

const findUserByIdentifier = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail) {
    return User.findOne({ email: normalizedEmail });
  }

  return null;
};

// Login (request OTP by email)
exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[AUTH][LOGIN] Request received', {
      email: normalizeEmail(email) || null,
    });
    const identifier = getIdentifier({ email });
    if (!identifier) {
      console.warn('[AUTH][LOGIN] Missing email in request');
      return res.status(400).json({ message: 'Email is required' });
    }
    console.log('[AUTH][LOGIN] Identifier resolved', {
      key: identifier.key,
      type: identifier.type,
      value: identifier.value,
    });

    try {
      const userDoc = await findUserByIdentifier({ email });
      if (!userDoc) {
        console.warn('[AUTH][LOGIN] User not found for identifier', {
          key: identifier.key,
        });
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

      await AuthOtp.findOneAndUpdate(
        { key: identifier.key },
        {
          key: identifier.key,
          otp,
          uid: String(userDoc._id),
          type: identifier.type,
          value: identifier.value,
          expiresAt,
          attempts: 0,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      );
      console.log('[AUTH][LOGIN] OTP stored', {
        key: identifier.key,
        uid: String(userDoc._id),
        expiresAt: expiresAt.toISOString(),
      });

      await sendOtpOutOfBand({
        type: identifier.type,
        value: identifier.value,
        otp,
      });
      console.log('[AUTH][LOGIN] OTP delivery flow completed', {
        key: identifier.key,
        type: identifier.type,
      });

      return res.json({
        message: `OTP sent to your ${identifier.type}.`,
      });
    } catch (error) {
      console.error('[AUTH][LOGIN] OTP send/store failed', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
      });
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
    console.log('[AUTH][VERIFY] Request received', {
      email: normalizeEmail(email) || null,
      otpLength: `${otp || ''}`.length,
    });
    const identifier = getIdentifier({ email });
    if (!identifier || !otp) {
      console.warn('[AUTH][VERIFY] Missing identifier or otp', {
        hasIdentifier: Boolean(identifier),
        hasOtp: Boolean(otp),
      });
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    console.log('[AUTH][VERIFY] Identifier resolved', {
      key: identifier.key,
      type: identifier.type,
    });

    const otpDoc = await AuthOtp.findOne({ key: identifier.key });
    if (!otpDoc) {
      console.warn('[AUTH][VERIFY] OTP doc not found', { key: identifier.key });
      return res.status(400).json({ message: 'OTP not requested or expired' });
    }
    console.log('[AUTH][VERIFY] OTP doc found', {
      key: identifier.key,
      attempts: otpDoc.attempts || 0,
      expiresAt: otpDoc.expiresAt,
    });

    const otpData = otpDoc;
    const now = Date.now();
    const expiryMs = new Date(otpData.expiresAt || 0).getTime();
    if (!expiryMs || now > expiryMs) {
      console.warn('[AUTH][VERIFY] OTP expired', {
        key: identifier.key,
        nowIso: new Date(now).toISOString(),
        expiryIso: otpData.expiresAt
          ? new Date(otpData.expiresAt).toISOString()
          : null,
      });
      await AuthOtp.deleteOne({ key: identifier.key });
      return res.status(400).json({ message: 'OTP expired. Request again.' });
    }

    if (`${otpData.otp || ''}` !== `${otp}`) {
      console.warn('[AUTH][VERIFY] OTP mismatch', {
        key: identifier.key,
        expectedLength: `${otpData.otp || ''}`.length,
        receivedLength: `${otp}`.length,
      });
      await AuthOtp.updateOne(
        { key: identifier.key },
        { $set: { attempts: (otpData.attempts || 0) + 1 } },
      );
      return res.status(401).json({ message: 'Invalid OTP' });
    }
    console.log('[AUTH][VERIFY] OTP matched');

    const userDoc = await User.findById(otpData.uid);
    if (!userDoc) {
      console.warn('[AUTH][VERIFY] User not found for OTP uid', {
        uid: otpData.uid,
        key: identifier.key,
      });
      return res.status(401).json({
        message: 'User not found. Please register first.',
      });
    }

    const userData = userDoc;
    const { accessToken, refreshToken } = generateTokens(
      String(userDoc._id),
      userData.email,
    );

    await AuthOtp.deleteOne({ key: identifier.key });
    console.log('[AUTH][VERIFY] OTP verify success', {
      uid: String(userDoc._id),
      key: identifier.key,
    });
    return res.json({
      user: {
        uid: String(userDoc._id),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[AUTH][VERIFY] Unexpected failure', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (
      !normalizedEmail ||
      !normalizedPhone ||
      !normalizedFirstName ||
      !normalizedLastName
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!NAME_REGEX.test(normalizedFirstName) || normalizedFirstName.length < 2) {
      return res.status(400).json({
        message: 'First name must contain at least 2 letters only',
      });
    }
    if (!NAME_REGEX.test(normalizedLastName) || normalizedLastName.length < 2) {
      return res.status(400).json({
        message: 'Last name must contain at least 2 letters only',
      });
    }
    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit phone number',
      });
    }
    if (INVALID_SERIES_PHONES.has(normalizedPhone)) {
      return res.status(400).json({
        message: 'Please enter a real phone number',
      });
    }
    try {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          message: 'Email already registered. Please login.',
        });
      }
      const existingPhone = await User.findOne({ phone: normalizedPhone });
      if (existingPhone) {
        return res.status(409).json({
          message: 'Phone already registered. Please login.',
        });
      }

      await User.create({
        email: normalizedEmail,
        phone: normalizedPhone,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      });
      res.json({ message: 'Account created. Please login with OTP.' });
    } catch (error) {
      console.error('Register Error:', error);
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
    const userDoc = await User.findById(uid);
    if (!userDoc) {
      return res.status(403).json({
        message: 'User not found in database. Please register again.',
      });
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      uid,
      userDoc.email,
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

// Google Login (issues backend JWT for existing user email)
exports.googleLogin = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'email is required' });
    }

    const userDoc = await User.findOne({ email: normalizedEmail });
    if (!userDoc) {
      return res.status(404).json({
        message: 'User not registered. Please register first.',
        shouldRegister: true,
        prefill: {
          email: normalizedEmail,
          firstName: firstName?.trim() || undefined,
          lastName: lastName?.trim() || undefined,
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(
      String(userDoc._id),
      userDoc.email,
    );
    return res.json({
      user: {
        uid: String(userDoc._id),
        email: userDoc.email,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        phone: userDoc.phone,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[AUTH][GOOGLE_LOGIN] Failed', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });
    return res.status(500).json({ message: 'Google login failed' });
  }
};
