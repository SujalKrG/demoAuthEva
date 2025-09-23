// occasionFieldRepo.js
import { sequelize, Sequelize, remoteSequelize } from "../models/index.js";
import OccasionModelFactory from "../models/remote/occasion.js";
import OccasionFieldModelFactory from "../models/occasionfield.js";

const OccasionModel = OccasionModelFactory(remoteSequelize, Sequelize.DataTypes);
const OccasionFieldModel = OccasionFieldModelFactory(sequelize, Sequelize.DataTypes);

export const bulkCreateOccasionFields = (data, transaction, adminId) => {
  return OccasionFieldModel.bulkCreate(data, {
    validate: true,
    transaction,
    individualHooks: true,
    userId: adminId,
  });
};

export const updateOccasionFieldById = (id, updates, adminId) => {
  return OccasionFieldModel.update(updates, {
    where: { id },
    individualHooks: true,
    user: { id: adminId },
    userTargetId: adminId,
  });
};

export const deleteOccasionFieldById = (id, adminId) => {
  return OccasionFieldModel.findByPk(id).then((field) =>
    field?.destroy({ individualHooks: true, userId: adminId })
  );
};

export const findAllOccasionFields = () => OccasionFieldModel.findAll({ order: [["order_no", "ASC"]] });

export const findOccasionFieldById = (id) => OccasionFieldModel.findByPk(id);

export const findAllActiveOccasions = () =>
  OccasionModel.findAll({ where: { invitation_status: true } });

export const findOccasionById = (id) =>
  OccasionModel.findOne({ where: { id, invitation_status: true } });
