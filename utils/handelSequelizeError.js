const handleSequelizeError = (error, res) => {
  // Log everything for developers
  logger.error(`[Sequelize Error] ${error.message}`, {
    name: error.name,
    stack: error.stack,
    errors: error.errors || [],
  });

  // Return only safe, minimal responses
  switch (error.name) {
    case "SequelizeValidationError":
      return res.status(400).json({
        success: false,
        message: "Invalid input data.",
      });

    case "SequelizeUniqueConstraintError":
      return res.status(409).json({
        success: false,
        message: "Duplicate entry. This record already exists.",
      });

    case "SequelizeForeignKeyConstraintError":
      return res.status(400).json({
        success: false,
        message: "Invalid reference. Please check related data.",
      });

    case "SequelizeConnectionError":
    case "SequelizeConnectionRefusedError":
    case "SequelizeHostNotFoundError":
    case "SequelizeHostNotReachableError":
    case "SequelizeInvalidConnectionError":
      return res.status(503).json({
        success: false,
        message: "Service temporarily unavailable. Please try again later.",
      });

    default:
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
  }
};

export default handleSequelizeError;
