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
          id: f.id,
          field_key: f.field_key,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options,
          order_no: f.order_no,
        })),
      };
    });
    res.json(response);
  } catch (error) {
    console.error("Error fetching occasion fields:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
