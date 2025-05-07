import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../model/userSchema.js';
import dotenv from 'dotenv';
import logger from '../../utils/logger.js';
dotenv.config();

const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'production'
            ? `${process.env.MYDOMAIN}/api/auth/google/callback`
            : 'http://localhost:3000/api/auth/google/callback',
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists but was registered with password, update Google ID
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
              logger.log('Updated Google ID for user:', user);
            }
            return done(null, user);
          }

          // Create new user with Google data
          const newUser = await User.create({
            googleId: profile.id,
            username: `google_${profile.id}`,
            firstname: profile.name.givenName || '',
            lastname: profile.name.familyName || '',
            email: profile.emails[0].value,
            photo: profile.photos[0]?.value || null,
          });

          return done(null, newUser);
        } catch (err) {
          logger.error('Google auth error:', err);
          return done(err, null);
        }
      }
    )
  );
};

export default configurePassport;
