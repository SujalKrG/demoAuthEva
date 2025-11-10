// occasionRepo.js
import { where } from "sequelize";
import { Sequelize, remoteSequelize } from "../models/index.js";
import OccasionModelFactory from "../models/remote/occasion.js";

// Initialize remote Occasion model
const OccasionModel = OccasionModelFactory(
  remoteSequelize,
  Sequelize.DataTypes
);

export const findAllActiveOccasions = () => {
  return OccasionModel.findAll({ where: { invitation_status: true } });
};
export const findOccasionBySlug = async (slug) => {
  return await OccasionModel.findOne({ where: { slug } });
};
export const updateOccasion = async (occasion, updates) => {
  Object.assign(occasion, updates);
  return await occasion.save();
};

export const findOccasionById = async (id) => {
  return await OccasionModel.findOne({
    where: { id: id },
    attributes: ["name"],
  });
};
