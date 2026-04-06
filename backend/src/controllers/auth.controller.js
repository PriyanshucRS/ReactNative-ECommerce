const authService = require('../service/auth.service');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const result = await authService.registerUser(req.body);
    res
      .status(201)
      .json({ message: 'User registered. Please login.', user: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
