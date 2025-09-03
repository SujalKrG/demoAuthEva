// occasionController.js
import { sequelize, Sequelize, remoteSequelize } from "../../models/index.js";
import OccasionResource from "../../utils/occasionResource.js";

// Import model factories
import OccasionModelFactory from "../../models/remote/occasion.js";
import OccasionFieldModelFactory from "../../models/occasionfield.js";

// Initialize models
const OccasionModel = OccasionModelFactory(remoteSequelize, Sequelize.DataTypes);
const OccasionFieldModel = OccasionFieldModelFactory(sequelize, Sequelize.DataTypes);

// occasion controller
export const getOccasions = async (req, res) => {
  try {
    const occasions = await OccasionModel.findAll({
      where: { invitation_status: true },
    });
    res.json(OccasionResource.collection(occasions));
  } catch (error) {
    console.error("Error fetching occasions:", error);
    res.status(500).json({success: false, message: "Failed to retrieve occasions", error: error.message });
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
