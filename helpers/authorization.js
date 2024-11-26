// helpers/authorization.js
exports.isAdmin = (user) => user && user.role === 'admin';
