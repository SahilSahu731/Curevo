import mongoose from "mongoose";
import "./env.js";

// Request bodies, query strings, and route params are rejected when they contain
// operator/prototype keys before reaching Mongoose. Global sanitizeFilter cannot be
// used here: Mongoose 8 rewrites trusted server-side filters such as
// `{ expiresAt: { $gt: now } }` into an invalid `$eq` object, breaking sessions.
mongoose.set("sanitizeFilter", false);
mongoose.set("strictQuery", true);

const DEFAULT_SERVER_SELECTION_TIMEOUT_MS = 10000;

const getMongoHost = (uri) => {
  try {
    return new URL(uri).hostname;
  } catch {
    return "invalid MongoDB URI";
  }
};

const isSrvLookupError = (error) => {
  return (
    error?.code === "ENOTFOUND" ||
    error?.code === "ECONNREFUSED" ||
    /querySrv/i.test(error?.message || "")
  );
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing. Set it in apps/web/.env.local before starting Curevo.");
  }

  try {
    const conn = await mongoose.connect(uri, {
      ...(process.env.NODE_ENV === "production" ? { tls: true } : {}),
      serverSelectionTimeoutMS: Number(
        process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || DEFAULT_SERVER_SELECTION_TIMEOUT_MS
      ),
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);

    if (isSrvLookupError(error) && uri.startsWith("mongodb+srv://")) {
      console.error(`Could not resolve Atlas SRV host: ${getMongoHost(uri)}`);
      console.error("Fix MONGO_URI with the exact Atlas connection string, or use local dev MongoDB:");
      console.error("Set MONGO_URI to a local mongodb://127.0.0.1:27017/curevo value when developing.");
    }

    throw error;
  }
};

export default connectDB;
