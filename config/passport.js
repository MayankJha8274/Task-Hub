const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/user');

module.exports = function (passport) {
  // Local strategy for login using email + password
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // 1️⃣ Find user by email
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'No user found with that email' });
        }

        // 2️⃣ Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        // 3️⃣ Success — return user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // 4️⃣ Serialize user (store in session)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 5️⃣ Deserialize user (fetch full user by ID from session)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
