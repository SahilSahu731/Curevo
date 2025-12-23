import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists but detailed provider info isn't there, update it
            if (!user.providerId) {
              user.provider = 'google';
              user.providerId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // If user doesn't exist, create new user
          const newUser = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            profileImage: profile.photos[0].value,
            provider: 'google',
            providerId: profile.id,
            role: 'patient', // Default role for social login
            // Password is not required for google auth users
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
} else {
  console.warn("GOOGLE_CLIENT_ID not found in .env, skipping Google Strategy initialization.");
}

// Serialization (not strictly needed for stateless JWT but good for completeness/session compatibility)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
