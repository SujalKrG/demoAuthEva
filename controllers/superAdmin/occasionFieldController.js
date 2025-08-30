const { OccasionField } = require("../../models");

const occasionFieldController = async (req, res) => {
  try {
    let data = req.body;

    // Normalize: if single object → wrap in array
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (!data.length) {
      return res.status(400).json({ message: "No data provided" });
    }

    // 🔹 Sanitize input before validation
    data = data.map((item) => {
      const sanitizedItem = {};

      for (const key in item) {
        if (typeof item[key] === "string") {
          sanitizedItem[key] = item[key].trim(); // remove extra spaces
        } else {
          sanitizedItem[key] = item[key];
        }
      }

      // Optionally normalize case for field_key
      if (sanitizedItem.field_key) {
        sanitizedItem.field_key = sanitizedItem.field_key.trim();
      }

      return sanitizedItem;
    });

    // 🔹 Validate each record
    for (const [index, item] of data.entries()) {
      const requiredFields = [
        "occasion_id",
        "field_key",
        "label",
        "type",
        "order_no",
      ];

      // Check for missing required fields
      const missingFields = requiredFields.filter(
        (field) =>
          item[field] === undefined ||
          item[field] === null ||
          item[field] === ""
      );

      // Special validations
      if (typeof item.required !== "boolean") {
        missingFields.push("required (must be boolean)");
      }

      if (item.options && typeof item.options !== "object") {
        missingFields.push("options (must be object or null)");
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Validation failed for record at index ${index}`,
          missing_fields: missingFields,
        });
      }
    }

    // 🔹 Insert into DB
    const newOccasionFields = await OccasionField.bulkCreate(data, {
      validate: true,
      ignoreDuplicates: false, // set true if you want to skip duplicates
    });

    return res.status(201).json({
      message: `${newOccasionFields.length} Occasion field(s) created successfully`,
      data: newOccasionFields,
    });
  } catch (error) {
    console.error("OccasionField Error:", error);

    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error?.original?.code === "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        message:
          "Duplicate entry: some combination of occasion_id and order_no already exists",
        details: error?.errors?.map((e) => e.message) || error.message,
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Invalid occasion_id (foreign key constraint failed)",
      });
    }

    return res.status(500).json({
      message: "Failed to create occasion fields",
      error: error.message,
    });
  }
};

const getOccasionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate input
    if (!id) {
      return res.status(400).json({
        message: "Invalid request: ID parameter is required",
      });
    }

    // 2️⃣ Query database
    const occasionFields = await OccasionField.findAll({
      where: { id: id }, // filtering by `type` as per your last code
    });

    // 3️⃣ Handle no data found
    if (!occasionFields || occasionFields.length === 0) {
      return res.status(404).json({
        message: "No occasion fields found for the given type",
      });
    }

    // 4️⃣ Success response
    return res.status(200).json({
      message: "Occasion fields retrieved successfully",
      count: occasionFields.length,
      data: occasionFields,
    });
  } catch (error) {
    console.error("Get Occasion Details Error:", error);

    // 5️⃣ Handle Sequelize-specific errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database query error",
        error: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Database connection failed",
        error: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((e) => e.message),
      });
    }

    // 6️⃣ Generic fallback
    return res.status(500).json({
      message: "Failed to retrieve occasion fields due to an unexpected error",
      error: error.message,
    });
  }
};

module.exports = { getOccasionDetails };

module.exports = { occasionFieldController, getOccasionDetails };
