const { ObjectId } = require('mongodb');
const mongodb = require('../db/connection');

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

const logout = (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
};

module.exports = {
  isLoggedIn,
  logout
};

