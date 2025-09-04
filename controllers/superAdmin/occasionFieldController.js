import db from "../../models/index.js";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
import { sequelize, Sequelize, remoteSequelize } from "../../models/index.js";
import OccasionResource from "../../utils/occasionResource.js";
import OccasionModelFactory from "../../models/remote/occasion.js";
import OccasionFieldModelFactory from "../../models/occasionfield.js";

const OccasionModel = OccasionModelFactory(remoteSequelize, Sequelize.DataTypes);
const OccasionFieldModel = OccasionFieldModelFactory(sequelize, Sequelize.DataTypes);


//create occasion field controller
export const createOccasionField = async (req, res) => {
  try {
    let data = req.body;

    // Normalize: if single object → wrap in array
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (!data.length) {
      return res
        .status(400)
        .json({success: false,
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
          success: false,
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
    return res.status(201).json({success: true,
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
        success: false,
        message:
          "Duplicate entry: some combination of occasion_id and order_no already exists",
        details: error?.errors?.map((e) => e.message) || error.message,
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Invalid occasion_id (foreign key constraint failed)",
      });
    }

    return res.status(500).json({
      success: false,
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
        success: false,
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
        success: false,
        message: "No occasion field found to update",
      });
    }

    // 4️⃣ Success response
    return res.status(200).json({
      success: true,
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

// Get All Occasion Fields controller
export const getAllOccasionFields = async (req, res) => {
  try {
    const occasions = await OccasionModel.findAll({
      where: { invitation_status: true },
    });
    const normalizedOccasions = OccasionResource.collection(occasions);
    const fields = await OccasionFieldModel.findAll();

    const response = normalizedOccasions.map((occasion) => {
      const relatedFields = fields.filter(
        (field) => field.occasion_id === occasion.occasionId
      );

      return {
        ...occasion, // id, name, slug, image, category
        formFields: relatedFields.map((f) => ({
          formFieldId: f.id,
          fieldKey: f.field_key,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options,
          orderNo: f.order_no,
        })),
      };
    });
    res.json(response);
  } catch (error) {
    console.error("Error fetching occasion fields:", error);
    res.status(500).json({success: false, message: "Internal server error", error: error.message });
  }
};

// Get Occasion Fields By ID controller
export const getOccasionFieldsById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate input
    if (!id) {
      return res.status(400).json({success: false,
        message: "Invalid request: ID parameter is required",
      });
    }

    const occasion = await OccasionModel.findOne({
      where: { id, invitation_status: true },
    });

    if (!occasion) {
      return res.status(404).json({success: false,
        message: "No occasion found",
      });
    }

    const normalizedOccasion = new OccasionResource(occasion);

    // 2️⃣ Query database
    const occasionFields = await OccasionFieldModel.findAll({
      where: { occasion_id: id },
    });

    // 3️⃣ Handle no data found
    if (!occasionFields || occasionFields.length === 0) {
      return res.status(404).json({success: false,
        message: "No occasion fields found",
      });
    }

    // attach fields
    const response = {
      ...normalizedOccasion,
      formFields: occasionFields.map((f) => ({
        formFieldId: f.id,
        fieldKey: f.field_key,
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options,
        orderNo: f.order_no,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get Occasion Fields Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve occasion fields",
      error: error.message,
    });
  }
};