import db from "../models/index.js";
import { Op } from "sequelize";

const { MessageTemplate, MessageChannel } = db;

export const MessageTemplateRepository = {
  async createTemplate(data, transaction) {
    return await MessageTemplate.create(data, { transaction });
  },
  async findByName(name) {
    return await db.MessageTemplate.findOne({ where: { name } });
  },
  async findOccasionById(OccasionModel, id) {
    return await OccasionModel.findByPk(id);
  },

  async findChannelById(id) {
    return await MessageChannel.findByPk(id);
  },
  async updateTemplateStatus(id, status, transaction = null) {
    const template = await MessageTemplate.findByPk(id);
    if (!template) return null;

    template.status = status;
    await template.save({ transaction });
    return template;
  },

  async findTemplatesWithFilters(filters, pagination, sorting) {
    const { limit, offset } = pagination;
    const { sort_by, order } = sorting;

    return await MessageTemplate.findAndCountAll({
      where: filters,
      include: [
        {
          model: MessageChannel,
          as: "channel",
          attributes: ["id", "name", "code"],
        },
      ],
      limit,
      offset,
      order: [[sort_by, order.toUpperCase()]],
    });
  },
};
