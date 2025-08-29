// occasionController.js
const { remoteSequelize, Sequelize } = require("../../models");
const OccasionResource = require("../../utils/occasionResource.js");
const OccassionModel = require("../../models/remote/occasion.js")(
  remoteSequelize,
  Sequelize.DataTypes
);

exports.occasions = async (req, res) => {
  try {
    const occasions = await OccassionModel.findAll({
      where: { invitation_status: true },
    });
    res.json(OccasionResource.collection(occasions));
  } catch (error) {
    console.error("Error fetching occasions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
