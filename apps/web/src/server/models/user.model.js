import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      set: (value) => String(value).trim().toLowerCase(),
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
    },
    emailVerifiedAt: Date,
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"]
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },
    dateOfBirth: {
      type: Date
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot vary more than 500 characters"]
    },
    password: {
      type: String,
      required() { return this.provider === "local"; },
      select: false,
      minlength: [12, "Password must be at least 12 characters long"],
      maxlength: [128, "Password cannot exceed 128 characters"]
    },
    role: {
      type: String,
      enum: {
        values: ["member", "admin"],
        message: "{VALUE} is not a valid role"
      },
      default: "member"
    },
    profileImage: { type: String },
    profileImagePublicId: { type: String, select: false },
    provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    providerId: { type: String, select: false },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    pendingEmailChange: {
      requestId: String,
      newEmail: String,
      oldConfirmedAt: Date,
      newConfirmedAt: Date,
      expiresAt: Date,
    },
    mfa: {
      enabled: { type: Boolean, default: false },
      secretEncrypted: { type: String, select: false },
      pendingSecretEncrypted: { type: String, select: false },
      pendingExpiresAt: Date,
      recoveryCodeHashes: { type: [String], select: false, default: undefined },
      enabledAt: Date,
    },
    notificationPreferences: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      focusUpdates: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      locale: { type: String, default: "en-IN" },
    },
  },
  { timestamps: true }
);
UserSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  if (!this.password || typeof candidate !== "string") return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

UserSchema.index(
  { provider: 1, providerId: 1 },
  { unique: true, partialFilterExpression: { providerId: { $type: "string" } } },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
