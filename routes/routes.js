// routes/routes.js
const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const { storage } = require('../config/config'); // Import storage configuration
const upload = multer({ storage }); // Use Cloudinary storage
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { ensureAdmin } = require('../middlewares/authMiddleware');


// Welcome page route
router.get('/', mainController.showWelcomePage);

// Signup routes
router.get('/signup', mainController.showSignupPage);
router.post('/signup', mainController.signup);

// Login routes
router.get('/login', mainController.showLoginPage);
router.post('/login', mainController.login);

// Dashboard route
router.get('/dashboard', ensureAuthenticated, mainController.dashboard);


// Profile routes
router.get('/profile', ensureAuthenticated, mainController.showProfile);
router.get('/profile/edit', ensureAuthenticated, mainController.showEditProfile);
router.post('/profile/edit', ensureAuthenticated, mainController.editProfile);

// Track watched video
router.get('/videos/:id/watch', mainController.ensureAuthenticated, mainController.trackWatchedVideo);


// ** Video Management Routes (Admin Only) **

// Route to display the upload form

router.get('/upload', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('Admin/upload');
});
router.post('/upload', ensureAuthenticated, ensureAdmin, upload.single('videoFile'), mainController.uploadVideo);
router.get('/videos', ensureAuthenticated, ensureAdmin, mainController.index);
// Route to handle video upload form submission

// Show individual video details
router.get('/videos/:id', ensureAuthenticated, mainController.showVideo);

// Edit video details (admin only)
router.get('/videos/:id/edit', ensureAuthenticated, ensureAdmin, mainController.editVideo);
router.post('/videos/:id/edit', ensureAuthenticated, ensureAdmin, upload.single('videoFile'), mainController.updateVideo);

// Delete a video (admin only)
router.post('/videos/:id/delete', ensureAuthenticated, ensureAdmin, mainController.deleteVideo);

// Profile Watch History
// Route to track watched video
router.post('/videos/:id/watch', ensureAuthenticated, mainController.trackWatchedVideo);

// Logout route
router.get('/logout', ensureAuthenticated, mainController.logout);


module.exports = router;
