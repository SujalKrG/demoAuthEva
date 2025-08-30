// occasionController.js
const { remoteSequelize, Sequelize, sequelize } = require("../../models");
const OccasionResource = require("../../utils/occasionResource.js");
const OccasionModel = require("../../models/remote/occasion.js")(
  remoteSequelize,
  Sequelize.DataTypes
);
const OccasionFieldModel = require("../../models/occasionfield.js")(
  sequelize,
  Sequelize.DataTypes
);

exports.occasions = async (req, res) => {
  try {
    const occasions = await OccasionModel.findAll({
      where: { invitation_status: true },
    });
    res.json(OccasionResource.collection(occasions));
  } catch (error) {
    console.error("Error fetching occasions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllOccasionFields = async (req, res) => {
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
        ...occasion, // <-- already has id, name, slug, image, category
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
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOccasionFieldsById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate input
    if (!id) {
      return res.status(400).json({
        message: "Invalid request: ID parameter is required",
      });
    }

    const occasion = await OccasionModel.findOne({
      where: { id, invitation_status: true },
    });

    if (!occasion) {
      return res.status(404).json({
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
      return res.status(404).json({
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
      message: "Failed to retrieve occasion fields",
      error: error.message,
    });
  }
};
