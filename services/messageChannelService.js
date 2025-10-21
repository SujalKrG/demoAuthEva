import {
  createMessageChannelRepo,
  findChannelByCodeRepo,
} from "../repositories/messageChannelRepository.js";
import { cleanString } from "../utils/occasionResource.js";

export const createMessageChannelService = async (data) => {
  const { name, code, provider, description, status } = data;
  if (!name || !code) {
    throw new Error("Name and code are required.");
  }
  const existingChannel = await findChannelByCodeRepo(code);
  if (existingChannel) {
    throw new Error("Channel code already exists.");
  }
  const channel = await createMessageChannelRepo({
    name: cleanString(name),
    code,
    provider,
    description,
    status,
  });
  return channel;
};
