const errorHandler = (err, req, res, next) => {
  console.error("Error encountered:", err.stack || err.message);

  let error = { ...err };
  error.message = err.message;

  // Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message).join(", ");
    return res.status(400).json({ success: false, message });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    return res.status(400).json({ success: false, message });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
