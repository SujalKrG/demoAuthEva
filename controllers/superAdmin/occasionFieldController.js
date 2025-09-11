import db from "../../models/index.js";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
import { sequelize, Sequelize, remoteSequelize } from "../../models/index.js";
import OccasionResource from "../../utils/occasionResource.js";
import OccasionModelFactory from "../../models/remote/occasion.js";
import OccasionFieldModelFactory from "../../models/occasionfield.js";

const OccasionModel = OccasionModelFactory(
  remoteSequelize,
  Sequelize.DataTypes
);
const OccasionFieldModel = OccasionFieldModelFactory(
  sequelize,
  Sequelize.DataTypes
);

//create occasion field controller
export const createOccasionField = async (req, res) => {
  try {
    let data = req.body;

    // Normalize: if single object → wrap in array
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (!data.length) {
      return res.status(400).json({
        success: false,
        message:
          "No data provided(length check for array in occasionFieldController)",
      });
    }

    // 🔹 Normalize + coerce types (handles JSON and multipart form-data)
    data = data.map((raw) => {
      const item = {};
      // trim strings
      for (const k in raw) {
        item[k] = typeof raw[k] === "string" ? raw[k].trim() : raw[k];
      }
      // normalize field_key
      if (item.field_key) item.field_key = item.field_key.trim();
      // numbers
      if (item.occasion_id != null) item.occasion_id = Number(item.occasion_id);
      if (item.order_no != null) item.order_no = Number(item.order_no);
      // booleans (required may arrive as "true"/"false"/"1"/"0")
      if (typeof item.required === "string") {
        const s = item.required.toLowerCase();
        item.required = s === "true" || s === "1" || s === "yes";
      }
      // options: can arrive as JSON string or CSV
      if (typeof item.options === "string") {
        const s = item.options.trim();
        if (!s || s.toLowerCase() === "null") {
          item.options = null;
        } else {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) item.options = parsed;
            else if (parsed && Array.isArray(parsed.values))
              item.options = parsed.values;
            else if (parsed && typeof parsed === "object")
              item.options = Object.values(parsed);
            else item.options = [String(parsed)];
          } catch {
            // CSV fallback: "Bride,Groom"
            item.options = s
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean);
          }
        }
      }
      // ensure options is array or null (what the UI expects)
      if (item.options != null && !Array.isArray(item.options)) {
        if (typeof item.options === "object")
          item.options = Object.values(item.options);
        else item.options = [String(item.options)];
      }
      return item;
    });

    // 🔹 Validate each record (after coercion)
    for (const [index, item] of data.entries()) {
      const requiredFields = [
        "occasion_id",
        "field_key",
        "label",
        "type",
        "order_no",
      ];
      const missingFields = requiredFields.filter(
        (f) => item[f] === undefined || item[f] === null || item[f] === ""
      );
      if (typeof item.required !== "boolean") {
        missingFields.push("required (must be boolean)");
      }
      if (!(item.options == null || Array.isArray(item.options))) {
        missingFields.push("options (must be array or null)");
      }
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Validation failed for record at index ${index}`,
          missing_fields: missingFields,
          received: item,
        });
      }
    }

    // 🔹 Insert into DB
    await db.sequelize.transaction(async (t) => {
      await db.OccasionField.bulkCreate(data, {
        validate: true,
        transaction: t,
        individualHooks: true,
        userId: req.admin?.id,
      }); // 🔑 required for activity hooks
    });
    return res.status(201).json({
      success: true,
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: ID parameter is required",
      });
    }

    // 🔹 Update record with activity hooks
    const [updated] = await db.OccasionField.update(safeUpdates, {
      where: { id },
      individualHooks: true,
      user: { id: req.admin?.id },
      userTargetId: req.admin?.id,
      // userId:  req.admin?.id||null,
      // entity affected
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Occasion field not found or no changes made",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Occasion field with ID (${id}) updated successfully`,
    });
  } catch (error) {
    console.error("Update Occasion Field Error:", error);

    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

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
    await occasionField.destroy({
      individualHooks: true,
      userId: req.admin?.id, // 🔑 required for activity hooks
    });

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
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Occasion Fields By ID controller
export const getOccasionFieldsById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: ID parameter is required",
      });
    }

    const occasion = await OccasionModel.findOne({
      where: { id, invitation_status: true },
    });

    if (!occasion) {
      return res
        .status(404)
        .json({ success: false, message: "No occasion found" });
    }

    const normalizedOccasion = new OccasionResource(occasion);

    // 2️⃣ Query database
    const occasionFields = await OccasionFieldModel.findAll({
      where: { occasion_id: id },
    });

    // 3️⃣ Handle no data found
    if (!occasionFields || occasionFields.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No occasion fields found" });
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
