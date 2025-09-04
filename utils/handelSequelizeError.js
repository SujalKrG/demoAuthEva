 const handleSequelizeError = (error, res) => {
  switch (error.name) {
    case "SequelizeDatabaseError":
      return res
        .status(500)
        .json({ success: false, message: "Database query error", error: error.message });
    case "SequelizeConnectionError":
    case "SequelizeConnectionRefusedError":
    case "SequelizeHostNotFoundError":
    case "SequelizeHostNotReachableError":
    case "SequelizeInvalidConnectionError":
      return res
        .status(503)
        .json({ success: false, message: "Database connection failed", error: error.message });
    case "SequelizeValidationError":
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((e) => e.message),
      });
    case "SequelizeUniqueConstraintError":
    case "ER_DUP_ENTRY":
      return res.status(409).json({
        success: false,
        message: "Unique constraint violation",
        errors: error.errors.map((e) => e.message),
      });
    case "SequelizeForeignKeyConstraintError":
      return res.status(400).json({
        success: false,
        message: "Invalid foreign key reference",
        error: error.message,
      });
    default:
      return null; // fallback to generic handler
  }
};
export default handleSequelizeError;
