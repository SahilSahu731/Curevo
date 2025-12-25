import User from "../models/user.model.js";
import { sendTokenResponse, generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create user (Validations from Model will run here)
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    console.log(error)
    res.status(500).json({ success: false, error: error.message });
  }
};

// login 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please provide an email and password" });
    }

    // Check for user and select password (if you set select: false in schema later)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Check if password matches using the Model method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message });
  }
};

// logout
export const logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};

// get current user
export const getMe = async (req, res) => {
  try {
    // req.user is usually set by your 'protect' middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, error: "Incorrect current password" });
    }

    user.password = newPassword;
    
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ... existing code

// Update User Details
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email, // keeping email updatable for now, though often restricted
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      bio: req.body.bio
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Profile Image
export const updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No image file provided" });
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        // Import cloudinary dynamically or from config
        const cloudinary = (await import("../config/cloudinary.js")).default;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "curevo/profiles",
            resource_type: "auto"
        });

        const user = await User.findByIdAndUpdate(req.user.id, {
            profileImage: result.secure_url
        }, { new: true });

        res.status(200).json({
            success: true,
            data: user,
            message: "Profile image updated successfully"
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, error: "Image upload failed" });
    }
};

// Google Callback
export const googleCallback = async (req, res) => {
// ... existing code
  try {
    // Passport middleware attaches user to req.user
    const user = req.user;
    const token = generateToken(user._id);

    // Cookie options
    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production"
    };

    if (process.env.NODE_ENV === "production") {
      options.secure = true;
    }

    res.cookie("token", token, options);

    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error(error);
    res.status(500).redirect(`${process.env.CLIENT_URL}/login?error=Server%20Error`);
  }
};