// middleware/multer.js
import multer from "multer";
import fs from "fs";
import path from "path";


// Ensure the uploads directory exists
const uploadsDir = "./uploads/tmp"; // Use a temporary directory for deployment
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Use the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname); // Generate a unique filename
    },
});

// File filter (optional, restrict to images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};


// Initialize Multer with the storage configuration
const upload = multer({ storage, fileFilter });

export default upload;