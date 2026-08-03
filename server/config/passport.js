import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const emailEntry = profile.emails?.[0];
      const email = emailEntry?.value?.trim().toLowerCase();
      const verified = emailEntry?.verified === true || profile._json?.email_verified === true;
      if (!email || !verified) return done(null, false, { message: "A verified Google email is required" });

      if (req.oauthLinkUserId) {
        const linkUser = await User.findById(req.oauthLinkUserId).select("+providerId");
        if (!linkUser || linkUser.email !== email) return done(null, false, { message: "Google email must match the signed-in account" });
        const duplicate = await User.exists({ providerId: profile.id, _id: { $ne: linkUser._id } });
        if (duplicate) return done(null, false, { message: "Google account is already linked" });
        linkUser.providerId = profile.id;
        linkUser.emailVerifiedAt ||= new Date();
        await linkUser.save();
        return done(null, linkUser);
      }

      let user = await User.findOne({ providerId: profile.id }).select("+providerId");
      if (user) return done(null, user);

      user = await User.findOne({ email }).select("+providerId");
      if (user) {
        if (user.provider !== "google") return done(null, false, { message: "Sign in with your password, then link Google from your profile" });
        if (user.providerId && user.providerId !== profile.id) return done(null, false, { message: "Google account mismatch" });
        user.providerId = profile.id;
        user.emailVerifiedAt ||= new Date();
        await user.save();
        return done(null, user);
      }

      if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_WRITES !== "true") {
        return done(null, false, { message: "New accounts are disabled while this deployment is under review" });
      }
      const newUser = await User.create({
        name: profile.displayName || email.split("@")[0],
        email,
        emailVerifiedAt: new Date(),
        profileImage: profile.photos?.[0]?.value,
        provider: "google",
        providerId: profile.id,
        role: "patient",
      });
      return done(null, newUser);
    } catch (error) {
      return done(error, false);
    }
  }));
}

export default passport;
