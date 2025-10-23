import db from "../models/index.js";

let channelConfigCache = null;

/**
 * Loads all message channels dynamically and caches them
 */
export const loadChannelConfig = async () => {
  if (channelConfigCache) return channelConfigCache;

  const channels = await db.MessageChannel.findAll({
    attributes: ["id", "code", "name", "provider", "description"],
    where: { status: 1 },
    raw: true,
  });

  const mapById = {};
  const mapByCode = {};

  channels.forEach((c) => {
    const code = c.code.toUpperCase();
    mapById[c.id] = c;
    mapByCode[code] = c;
  });

  channelConfigCache = {
    all: channels,
    byId: mapById,
    byCode: mapByCode,
  };

  return channelConfigCache;
};

/** Optional utility to refresh cache if DB updated */
export const refreshChannelConfig = async () => {
  channelConfigCache = null;
  return loadChannelConfig();
};
