const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_BYTES || 25 * 1024 * 1024), // 25MB default
  },
});

module.exports = { upload };

