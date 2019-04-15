const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local');
const keys = require('../config/keys');
const User = require('../models/User');
const GAuth = require('../models/GAuth');
const FBAuth = require('../models/FBAuth');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.query().findById(id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await GAuth.query().findOne({
        googleid: profile.id
      });
      if (existingUser) {
        done(null, { id: existingUser.uid });
      } else {
        const user = await User.query()
          .insert({})
          .returning('*');
        await user.$relatedQuery('googleauth').insert({ googleid: profile.id });
        done(null, user);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: keys.fbClientID,
      clientSecret: keys.fbClientSecret,
      callbackURL: '/auth/facebook/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await FBAuth.query().findOne({
        fbid: profile.id
      });
      if (existingUser) {
        done(null, { id: existingUser.uid });
      } else {
        const user = await User.query()
          .insert({})
          .returning('*');
        await user.$relatedQuery('facebookauth').insert({ fbid: profile.id });
        done(null, user);
      }
    }
  )
);