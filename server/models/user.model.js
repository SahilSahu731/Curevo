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
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
    },
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
      required: false, 
      minlength: [8, "Password must be at least 8 characters long"] 
    },
    role: { 
      type: String, 
      enum: {
        values: ["patient", "doctor", "admin"],
        message: "{VALUE} is not a valid role"
      },
      default: "patient" 
    },
    profileImage: { type: String },
    provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    providerId: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;