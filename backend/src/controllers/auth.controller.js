const { auth, db } = require('../service/firebaseService');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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

const getFirebaseApiKey = () => {
  if (process.env.FIREBASE_API_KEY) return process.env.FIREBASE_API_KEY;
  if (process.env.FIREBASE_WEB_API_KEY) return process.env.FIREBASE_WEB_API_KEY;

  try {
    const googleServicesPath = path.resolve(
      __dirname,
      '../../../android/app/google-services.json',
    );
    if (!fs.existsSync(googleServicesPath)) return null;

    const raw = fs.readFileSync(googleServicesPath, 'utf8');
    const parsed = JSON.parse(raw);
    const apiKey = parsed?.client?.[0]?.api_key?.[0]?.current_key;
    return apiKey || null;
  } catch (error) {
    return null;
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();
    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const firebaseApiKey = getFirebaseApiKey();
    if (!firebaseApiKey) {
      return res.status(500).json({
        message: 'Missing FIREBASE_API_KEY in server config',
      });
    }

    try {
      // Verify password with Firebase Identity Toolkit.
      const signInResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password: normalizedPassword,
            returnSecureToken: true,
          }),
        },
      );

      if (!signInResponse.ok) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const decodedUser = await auth.getUserByEmail(normalizedEmail);
      const userDoc = await db.collection('users').doc(decodedUser.uid).get();
      const userData = { uid: decodedUser.uid, ...userDoc.data() };
      const { accessToken, refreshToken } = generateTokens(
        decodedUser.uid,
        decodedUser.email,
      );
      res.json({ user: userData, accessToken, refreshToken });
    } catch (error) {
      console.error('Firebase Login Error:', error);
      res
        .status(401)
        .json({ message: 'Invalid credentials or user not found' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedFirstName = firstName?.trim();
    const normalizedLastName = lastName?.trim();
    if (!normalizedEmail || !password || !normalizedFirstName || !normalizedLastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    try {
      const newUser = await auth.createUser({ email: normalizedEmail, password });
      await db.collection('users').doc(newUser.uid).set({
        uid: newUser.uid,
        email: normalizedEmail,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const { accessToken, refreshToken } = generateTokens(
        newUser.uid,
        newUser.email,
      );
      res.json({
        user: {
          uid: newUser.uid,
          email: normalizedEmail,
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
        },
        accessToken,
        refreshToken,
      });
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
    const decodedUser = await auth.getUser(uid);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      uid,
      decodedUser.email,
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
