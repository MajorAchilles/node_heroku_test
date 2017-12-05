'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportFacebook = require('passport-facebook');

var _passportFacebook2 = _interopRequireDefault(_passportFacebook);

var _passportGoogleOauth = require('passport-google-oauth20');

var _passportGoogleOauth2 = _interopRequireDefault(_passportGoogleOauth);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes
var transformFacebookProfile = function transformFacebookProfile(profile) {
  return {
    name: profile.name,
    avatar: profile.picture.data.url
  };
};

// Transform Google profile into user object

// Import Facebook and Google OAuth apps configs
var transformGoogleProfile = function transformGoogleProfile(profile) {
  return {
    name: profile.displayName,
    avatar: profile.image.url
  };
};

// Register Facebook Passport strategy
_passport2.default.use(new _passportFacebook2.default(_config.facebook,
// Gets called when user authorizes access to their profile
async function (accessToken, refreshToken, profile, done) {
  return (
    // Return done callback and pass transformed user object
    done(null, transformFacebookProfile(profile._json))
  );
}));

// Register Google Passport strategy
_passport2.default.use(new _passportGoogleOauth2.default(_config.google, async function (accessToken, refreshToken, profile, done) {
  return done(null, transformGoogleProfile(profile._json));
}));

// Serialize user into the sessions
_passport2.default.serializeUser(function (user, done) {
  return done(null, user);
});

// Deserialize user from the sessions
_passport2.default.deserializeUser(function (user, done) {
  return done(null, user);
});

// Initialize http server
var app = (0, _express2.default)();

// Initialize Passport
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

// Set up Facebook auth routes
app.get('/auth/facebook', _passport2.default.authenticate('facebook'));

app.get('/auth/facebook/callback', _passport2.default.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
// Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
function (req, res) {
  return res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
});

// Set up Google auth routes
app.get('/auth/google', _passport2.default.authenticate('google', { scope: ['profile'] }));

var actualAddress;
var actualPort;

app.get('/auth/google/callback', _passport2.default.authenticate('google', { failureRedirect: '/auth/google' }), function (req, res) {
  return res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
});

app.get("/", function (req, res) {
  res.send('Server: ' + (actualAddress || actualPort));
});

// Launch the server on the port 3000


var server = app.listen(function () {
  var _server$address = server.address(),
      address = _server$address.address,
      port = _server$address.port;

  actualAddress = address;
  actualPort = port;
  console.log('Listening at http://' + address + ':' + port);
});
