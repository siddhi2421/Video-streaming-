// middlewares/authMiddleware.js
const { isAdmin } = require('../helpers/authorization');

module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

module.exports.ensureAdmin = (req, res, next) => {
  if (req.user && isAdmin(req.user)) {
    return next();
  }
  res.redirect('/dashboard'); // Redirect non-admins
};
