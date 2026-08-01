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

export default upload;
