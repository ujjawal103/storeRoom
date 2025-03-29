const multer = require("multer");
const path = require("path");

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: "uploads/", 
  filename: (req, file, cb) => {
    const uniquePrefix = req.user?.id || Date.now(); // Use user ID if available
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_"); // Remove special chars
    cb(null, safeName + "-" +uniquePrefix); // Unique filename
  },
});

// File type filter (Optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
