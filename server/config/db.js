import mongoose from "mongoose";

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
    throw new Error("MONGO_URI is missing. Set it in server/.env before starting the API.");
  }

  try {
    const conn = await mongoose.connect(uri, {
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
      console.error("MONGO_URI=mongodb://127.0.0.1:27017/curevo");
    }

    throw error;
  }
};

export default connectDB;
