import mongoose from "mongoose";
import "./env.js";

// Request bodies, query strings, and route params are rejected when they contain
// operator/prototype keys before reaching Mongoose. Global sanitizeFilter cannot be
// used here: Mongoose 8 rewrites trusted server-side filters such as
// `{ expiresAt: { $gt: now } }` into an invalid `$eq` object, breaking sessions.
mongoose.set("sanitizeFilter", false);
mongoose.set("strictQuery", true);

const DEFAULT_SERVER_SELECTION_TIMEOUT_MS = 10000;

const encodeMongoCredential = (value) => {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
};

// Atlas passwords commonly contain reserved URL characters. In particular, a
// raw `@` makes the MongoDB driver treat part of the password as the SRV host.
// Normalize only the credential section and leave the host/query untouched.
export const normalizeMongoUriCredentials = (uri) => {
  if (typeof uri !== "string" || !/^mongodb(?:\+srv)?:\/\//.test(uri)) return uri;
  const schemeEnd = uri.indexOf("://") + 3;
  const pathStart = uri.indexOf("/", schemeEnd);
  const authorityEnd = pathStart === -1 ? uri.length : pathStart;
  const authority = uri.slice(schemeEnd, authorityEnd);
  const lastAt = authority.lastIndexOf("@");
  if (lastAt === -1) return uri;
  const credentials = authority.slice(0, lastAt);
  const separator = credentials.indexOf(":");
  if (separator === -1) return uri;
  const username = encodeMongoCredential(credentials.slice(0, separator));
  const password = encodeMongoCredential(credentials.slice(separator + 1));
  const host = authority.slice(lastAt + 1);
  return `${uri.slice(0, schemeEnd)}${username}:${password}@${host}${uri.slice(authorityEnd)}`;
};

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
  const configuredUri = process.env.MONGO_URI;

  if (!configuredUri) {
    throw new Error("MONGO_URI is missing. Set it in apps/web/.env.local before starting Curevo.");
  }

  const uri = normalizeMongoUriCredentials(configuredUri);
  if (uri !== configuredUri) {
    console.warn("MONGO_URI contained unescaped credential characters; Curevo encoded them before connecting.");
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
