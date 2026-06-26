const asyncHandler = require('../utils/asyncHandler');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(201).json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path,
    filename: req.file.filename
  });
});

module.exports = { uploadImage };