// occasionController.js
import { sequelize, Sequelize, remoteSequelize } from "../../models/index.js";
import OccasionResource from "../../utils/occasionResource.js";
// Import model factories
import OccasionModelFactory from "../../models/remote/occasion.js";

// Initialize models
const OccasionModel = OccasionModelFactory(
  remoteSequelize,
  Sequelize.DataTypes
);

// occasion controller
export const getOccasions = async (req, res) => {
  try {
    const occasions = await OccasionModel.findAll({
      where: { invitation_status: true },
    });
    res.json(OccasionResource.collection(occasions));
  } catch (error) {
    console.error("Error fetching occasions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve occasions",
      error: error.message,
    });
  }
};

// export const additionalColumnAdd = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "ID parameter is missing",
//       });
//     }
//     const occasion = await OccasionModel.findByPk(id);
//     if (!occasion) {
//       return res.status(404).json({
//         success: false,
//         message: "Occasion not found",
//       });
//     }
//     const { event_details_theme, guest_preview_theme } = req.body;
//     if (!event_details_theme && !guest_preview_theme) {
//       return res.status(400).json({
//         success: false,
//         message: "No columns specified for addition",
//       });
//     }
//     if (event_details_theme !== undefined) {
//       occasion.event_details_theme = event_details_theme;
//     }
//     if (guest_preview_theme !== undefined) {
//       occasion.guest_preview_theme = guest_preview_theme;
//     }
//     await occasion.save();
//     res.json({
//       success: true,
//       message: "Columns added successfully",
//       data: occasion,
//     });
//   } catch (error) {
//     console.error("Error adding columns:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to add columns",
//       error: error.message,
//     });
//   }
// };
