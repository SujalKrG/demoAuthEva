// occasionController.js
import { sequelize, Sequelize, remoteSequelize } from "../../models/index.js";
import OccasionResource from "../../utils/occasionResource.js";

// Import model factories
import OccasionModelFactory from "../../models/remote/occasion.js";

// Initialize models
const OccasionModel = OccasionModelFactory(remoteSequelize, Sequelize.DataTypes);

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


