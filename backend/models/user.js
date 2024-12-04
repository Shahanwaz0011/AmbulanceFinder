const mongoose = require('mongoose');
const { Schema } = mongoose;

// User schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true, // Ensure phone number is unique
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['user', 'driver'], // 'user' or 'driver'
    required: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  location: {
    type: { type: String, enum: ['Point'], required: true }, // Geospatial data type
    coordinates: {
      type: [Number], // Coordinates are stored as [longitude, latitude]
      required: true,
      validate: {
        validator: function(value) {
          // Ensure coordinates are valid floating-point numbers (longitude, latitude)
          return (
            value[0] >= -180 && value[0] <= 180 && // Longitude range: -180 to 180
            value[1] >= -90 && value[1] <= 90 // Latitude range: -90 to 90
          );
        },
        message: 'Coordinates must be valid latitude and longitude values.',
      },
    },
  },
}, { timestamps: true });

// Create geospatial index for location (for geospatial queries)
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

module.exports = User;
