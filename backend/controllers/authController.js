const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Secret key for JWT (make sure to set this in your environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

exports.register = async (req, res) => {
  try {
    const { name, phone, password, type } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Log the received password (no hashing)
    console.log('Received password for registration:', password);

    // Create a new user without hashing the password
    const newUser = new User({
      name,
      phone,
      password, // Store the raw password
      type,
      location: {
        type: 'Point',
        coordinates: [0, 0], // Default location (can be updated later)
      },
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body; // Using 'phone' instead of 'email'

    // Search for user by phone number
    const userExist = await User.findOne({ phone });

    // If the user is not found, return an error
    if (!userExist) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Log the password and the stored password for comparison
    console.log('Provided Password:', password);
    console.log('Stored Password:', userExist.password);

    // Compare the provided password with the stored raw password
    if (password === userExist.password) {
      // Password matches, generate a JWT token
      const token = jwt.sign({ id: userExist._id }, JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({
        message: "Login successful",
        token,
        userID: userExist._id.toString(),
      });
    } else {
      // Password doesn't match, return error
      return res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    // Find the user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash the new password before updating
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare old password with stored password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password.' });
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyToken = (req, res, next) => {
  // Extract the token from the authorization header
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token is required.' });
  }

  // Verify the JWT token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    req.user = decoded; // Store decoded token data (user ID)
    next();
  });
};


exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body; // Receive latitude and longitude
    const userId = req.user.id; // User ID from the JWT token

    // Ensure lat and lng are provided and are valid
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and Longitude are required." });
    }

    // Get current time to track last location update
    const currentTime = new Date();

    // Update location in the database
    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [lng, lat], // Update the coordinates in [longitude, latitude] order
        },
        lastLocationUpdate: currentTime, // Track the last location update time
        isOnline: true, // Mark the user as online when their location is updated
      },
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Location updated successfully.', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getAllDrivers = async (req, res) => {
  try {
    // Find all users with type 'driver' and include specific fields
    const drivers = await User.find(
      { type: 'driver' },
      { name: 1, location: 1, phone: 1, isOnline: 1 } // Include name, location, phone, and isOnline fields
    );

    // Check if drivers exist
    if (!drivers || drivers.length === 0) {
      return res.status(404).json({ message: 'No drivers found.' });
    }

    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Controller to set user online status based on input
exports.switchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body; // Expecting 'isOnline' boolean from the frontend

    // Validate input
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'Invalid input. "isOnline" must be a boolean.' });
    }

    // Fetch the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user's online status
    user.isOnline = isOnline;
    await user.save();

    // Send response with the updated status
    return res.status(200).json({
      message: `User is now ${user.isOnline ? 'live' : 'not live'}.`,
      isOnline: user.isOnline,
    });
  } catch (error) {
    console.error('Error updating user status:', error.message);
    return res.status(500).json({ message: 'An error occurred while updating the status.', error: error.message });
  }
};
