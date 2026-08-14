import multer from "multer";

const storage = multer.memoryStorage();
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
  return cb(new Error("Unsupported file type."), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, parts: 25 } });

const signatureType = (buffer) => {
  if (!buffer?.length) return null;
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ) return "image/jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))) return "image/gif";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
};

const imageDimensions = (type, buffer) => {
  if (type === "image/png" && buffer.length >= 24) return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  if (type === "image/gif" && buffer.length >= 10) return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  if (type === "image/webp" && buffer.subarray(12, 16).toString("ascii") === "VP8X" && buffer.length >= 30) return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  if (type === "image/jpeg") {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1]; const size = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      if (!size) break;
      offset += size + 2;
    }
  }
  return null;
};

export const inspectUpload = (file) => {
  if (!file?.buffer) return { type: null, dimensions: null, malware: false };
  const type = signatureType(file.buffer);
  return { type, dimensions: imageDimensions(type, file.buffer), malware: file.buffer.toString("latin1").includes("EICAR-STANDARD-ANTIVIRUS-TEST-FILE") };
};

export const validateUploadSignature = (req, res, next) => {
  const file = req.file;
  const inspected = inspectUpload(file);
  const valid = file && inspected.type === file.mimetype && !inspected.malware
    && inspected.dimensions
    && inspected.dimensions.width > 0 && inspected.dimensions.height > 0
    && inspected.dimensions.width * inspected.dimensions.height <= 25_000_000;
  if (!valid) {
    if (file?.buffer) file.buffer.fill(0);
    req.file = undefined;
    return res.status(415).json({ success: false, error: "Image signature, dimensions, or malware checks failed." });
  }
  req.file.detectedType = inspected.type;
  return next();
};

export const validateProfileImage = (req, res, next) => {
  if (!req.file || !req.file.detectedType?.startsWith("image/")) return res.status(415).json({ success: false, error: "A supported image is required." });
  return next();
};

export const uploadTimeout = (req, res, next) => {
  req.setTimeout(15_000);
  return next();
};

export default upload;
