const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User model to get user data (optional)

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Check for token in the Authorization header
  const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"

  // If no token is provided, send an unauthorized response
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded data (user details) to the request object
    req.user = decoded;

    // Call the next middleware function or route handler
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
