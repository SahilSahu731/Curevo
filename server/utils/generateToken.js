import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, 
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true; 
  }

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      data: user,
    });
};