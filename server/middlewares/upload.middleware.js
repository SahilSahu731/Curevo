import multer from 'multer';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
]);

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Upload an image or PDF.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const hasSignature = (file) => {
    const buffer = file.buffer;
    if (!buffer?.length) return false;
    if (file.mimetype === 'image/jpeg') return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    if (file.mimetype === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (file.mimetype === 'image/gif') return ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'));
    if (file.mimetype === 'image/webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    if (file.mimetype === 'application/pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    return false;
};

export const validateUploadSignature = (req, res, next) => {
    if (!req.file || hasSignature(req.file)) return next();
    req.file.buffer.fill(0);
    req.file = undefined;
    return res.status(415).json({ success: false, error: 'File contents do not match the declared type.' });
};

export default upload;
