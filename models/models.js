// models/models.js
const mongoose = require('mongoose');

// User Schema - Only track watched video IDs
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  age: { type: Number },
  address: { type: String },
  phoneNumber: { type: Number },
  bio: { type: String },
  watchedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
});

// Video Schema
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }, // Added description field
  videoUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Define models for each schema
const User = mongoose.model('User', UserSchema);
const Video = mongoose.model('Video', VideoSchema);

// Export both models
module.exports = {
  User,
  Video,
};
