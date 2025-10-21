import db from "../models/index.js";

export const createMessageChannelRepo = async (data) => {
  return await db.MessageChannel.create(data);
};
export const findChannelByCodeRepo = async (code) => {
  return await db.MessageChannel.findOne({ where: { code } });
};
