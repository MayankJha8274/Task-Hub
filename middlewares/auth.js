function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // user is logged in → move ahead
  }
  res.redirect("/auth/login"); // user not logged in → redirect to login
}

module.exports = isAuthenticated;
