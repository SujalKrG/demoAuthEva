// occasionRepo.js
import { Sequelize, remoteSequelize } from "../models/index.js";
import OccasionModelFactory from "../models/remote/occasion.js";

// Initialize remote Occasion model
const OccasionModel = OccasionModelFactory(remoteSequelize, Sequelize.DataTypes);

export const findAllActiveOccasions = () => {
  return OccasionModel.findAll({ where: { invitation_status: true } });
};
