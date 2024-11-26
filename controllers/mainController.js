// controllers/mainController.js
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { User, Video } = require('../models/models');
const cloudinary = require('../config/config');
const { isAdmin } = require('../helpers/authorization');

// Render welcome page
exports.showWelcomePage = (req, res) => {
  res.render('layouts/welcome');
};

// Render signup page
exports.showSignupPage = (req, res) => {
  res.render('Roles/signup');
};

// Handle user signup
exports.signup = async (req, res) => {
  const { name, email, password, role, age, address, phoneNumber, bio } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('Roles/signup', { message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, age, address, phoneNumber, bio });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.redirect('/signup');
  }
};

// Render login page
exports.showLoginPage = (req, res) => {
  res.render('Roles/login');
};

// Handle user login
exports.login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
};

// Render dashboard based on user role
exports.dashboard = async (req, res) => {
  try {
    const videos = await Video.find(); // Fetch videos from the database

    // Check user role and render the appropriate dashboard with videos data
    if (req.user.role === 'admin') {
      res.render('Admin/adminDashboard', { user: req.user, videos });
    } else {
      res.render('User/userDashboard', { user: req.user, videos });
    }
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.redirect('/login');
  }
};


// Track watched video and store in user history
exports.trackWatchedVideo = async (req, res) => {
  try {
    const videoId = req.params.id; // Get the video ID from the request parameters
    const userId = req.user.id; // Get the current user ID

    // Find the user and add the video to watchedVideos if not already there
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        watchedVideos: { videoId, watchedAt: new Date() }
      }
    });

    res.redirect(`/videos/${videoId}`);
  } catch (error) {
    console.error("Error tracking watched video:", error);
    res.status(500).send("Error tracking watched video.");
  }
};


// Render profile page
exports.showProfile = (req, res) => {
  res.render('User/profile', { user: req.user });
};

// Render edit profile page
exports.showEditProfile = (req, res) => {
  res.render('User/editProfile', { user: req.user });
};

// Handle profile update with preferences
exports.editProfile = async (req, res) => {
  const { name, age, address, phoneNumber, bio, preferences } = req.body;

  try {
    await User.findByIdAndUpdate(req.user.id, { name, age, address, phoneNumber, bio, preferences });
    req.flash('success_msg', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.redirect('/profile/edit');
  }
};


// Middleware to ensure authentication
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Middleware to restrict admin-only actions
exports.ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/dashboard'); // Redirect non-admins to their dashboard
};

// Show all videos (admin only)
exports.index = async (req, res) => {
  if (req.user.role === 'admin') {
    const videos = await Video.find();
    res.render('Admin/index', { videos });
  } else {
    res.redirect('/dashboard');
  }
};

// Upload new video (admin only)
exports.uploadVideo = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/dashboard');
  }

  if (!req.file) {
    return res.status(400).send("No video file uploaded.");
  }

  try {
    const { title, description } = req.body; // Capture title and description
    const result = req.file; // Video is already uploaded to Cloudinary via Multer

    // Save video details to MongoDB
    const video = new Video({
      title,
      description,
      videoUrl: result.path, // Cloudinary URL
    });

    await video.save();

    console.log('Video details saved to MongoDB:', video);
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Error uploading video to Cloudinary or saving to MongoDB:", error);
    res.status(500).send("Error uploading video.");
  }
};





// Show video details
exports.showVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  res.render('Admin/show', { video });
};

// Edit video details (admin only)
exports.editVideo = async (req, res) => {
  if (req.user.role === 'admin') {
    const video = await Video.findById(req.params.id);
    res.render('Admin/edit', { video });
  } else {
    res.redirect('/dashboard');
  }
};

// Update video information (admin only)
exports.updateVideo = async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    try {
      const { title, description } = req.body; // Capture updated title and description
      const video = await Video.findById(req.params.id);

      if (!video) {
        return res.status(404).send("Video not found.");
      }

      if (req.file) {
        // Upload the new video to Cloudinary
        const result = req.file; // Cloudinary result handled by multer-storage-cloudinary
        video.videoUrl = result.path; // Update video URL to the new uploaded one
      }

      // Update title and description
      video.title = title || video.title;
      video.description = description || video.description;

      await video.save(); // Save updated video details
      res.redirect(`/videos/${video._id}`);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).send("Error updating video.");
    }
  } else {
    res.redirect('/dashboard');
  }
};




// Delete a video (admin only)
exports.deleteVideo = async (req, res) => {
  if (req.user.role === 'admin') {
    await Video.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } else {
    res.redirect('/dashboard');
  }
};

module.exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/login");
  });
};

