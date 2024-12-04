const cron = require('node-cron');
const User = require('../models/user');

// Function to mark users offline if inactive for 10 minute
const checkOfflineUsers = async () => {
  try {
    const currentTime = new Date();

    // Find users who have not updated their location in the last minute
    const offlineUsers = await User.find({
      "lastLocationUpdate": { $lt: new Date(currentTime - 10000) }, // 10000ms = 60s
    });

    // Mark users as offline
    offlineUsers.forEach(async (user) => {
      user.isOnline = false;
      await user.save(); // Save the changes to the database
      console.log(`User ${user._id} marked as offline due to inactivity.`);
    });
  } catch (error) {
    console.error("Error checking offline users:", error);
  }
};

// Schedule the cron job to run every minute
cron.schedule('* * * * *', checkOfflineUsers);
