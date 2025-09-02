import db from "../../models/index.js";
import handleSequelizeError from "../../utils/handelSequelizeError.js";

//create occasion field controller
export const occasionFieldController = async (req, res) => {
  try {
    let data = req.body;

    // Normalize: if single object → wrap in array
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (!data.length) {
      return res
        .status(400)
        .json({
          message:
            "No data provided(length check for array in occasionFieldController)",
        });
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
    await db.sequelize.transaction(async (t) => {
      await db.OccasionField.bulkCreate(data, {
        validate: true,
        transaction: t,
      });
    });
    return res.status(201).json({
      message: `${data.length} Occasion field(s) created successfully`,
      data: data,
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

// Update Occasion Field controller
export const updateOccasionField = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowedUpdates = [
      "field_key",
      "label",
      "type",
      "required",
      "options",
      "order_no",
    ];
    const safeUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // 1️⃣ Validate input
    if (!id) {
      return res.status(400).json({
        message: "Invalid request: ID parameter is required",
      });
    }

    // 2️⃣ Query database
    const [updated] = await db.OccasionField.update(safeUpdates, {
      where: { id },
    });

    // 3️⃣ Handle no data found
    if (!updated) {
      return res.status(404).json({
        message: "No occasion field found to update",
      });
    }

    // 4️⃣ Success response
    return res.status(200).json({
      message: `Occasion field with ID (${id}) updated successfully`,
    });
  } catch (error) {
    console.error("Update Occasion Field Error:", error);

    // Handle Sequelize errors
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    // Handle generic Node.js / unexpected errors
    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};

// Delete Occasion Field controller
export const deleteOccasionField = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate input
    if (!id) {
      return res.status(400).json({
        message: "Invalid request: ID parameter is required",
      });
    }

    const occasionField = await db.OccasionField.findByPk(id);

    if (!occasionField) {
      return res.status(404).json({
        message: `Occasion field with id ${id} not found`,
      });
    }

    // 🔹 Soft delete (sets deleted_at instead of removing row)
    await occasionField.destroy();

    // 4️⃣ Success response
    return res.status(200).json({
      message: `Occasion field with ID (${id}) deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Occasion Field Error:", error);

    // Handle Sequelize errors
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    // Handle generic Node.js / unexpected errors
    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
