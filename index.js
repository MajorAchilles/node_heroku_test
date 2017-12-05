"use strict";

var express = require("express");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook'");
var GoogleStrategy = require("passport-google-oauth20");

var _require = require("./config"),
    facebook = _require.facebook,
    google = _require.google;

var _require2 = require("http"),
    request = _require2.request;
// Import Facebook and Google OAuth apps configs

// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes


var transformFacebookProfile = function transformFacebookProfile(profile) {
  return {
    name: profile.name,
    avatar: profile.picture.data.url
  };
};

// Transform Google profile into user object
var transformGoogleProfile = function transformGoogleProfile(profile) {
  return {
    name: profile.displayName,
    avatar: profile.image.url
  };
};

// Register Facebook Passport strategy
passport.use(new FacebookStrategy(facebook,
// Gets called when user authorizes access to their profile
async function (accessToken, refreshToken, profile, done) {
  return (
    // Return done callback and pass transformed user object
    done(null, transformFacebookProfile(profile._json))
  );
}));

// Register Google Passport strategy
passport.use(new GoogleStrategy(google, async function (accessToken, refreshToken, profile, done) {
  return done(null, transformGoogleProfile(profile._json));
}));

// Serialize user into the sessions
passport.serializeUser(function (user, done) {
  return done(null, user);
});

// Deserialize user from the sessions
passport.deserializeUser(function (user, done) {
  return done(null, user);
});

// Initialize http server
var app = express();

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up Facebook auth routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
// Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
function (req, res) {
  return res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
});

// Set up Google auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

var actualAddress;
var actualPort;

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/google' }), function (req, res) {
  return res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
});

app.get("/", function (req, res) {
  res.send("Server: " + (actualAddress || actualPort));
});

// Launch the server on the port 3000


var server = app.listen(function () {
  var _server$address = server.address(),
      address = _server$address.address,
      port = _server$address.port;

  actualAddress = address;
  actualPort = port;
  console.log("Listening at http://" + address + ":" + port);
});
