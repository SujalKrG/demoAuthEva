// config/channelConfig.js
/**
 * Static mapping for channels and composite channels
 */
export const loadChannelConfig = {
  1: { id: 1, code: "WA", name: "WhatsApp" },
  2: { id: 2, code: "RCS", name: "RCS Message" },
  3: { id: 3, code: "WA|RCS",ids:[1,2], name: "WhatsApp OR RCS", mode: "fallback" },
  4: { id: 4, code: "WA&RCS",ids:[1,2], name: "WhatsApp AND RCS", mode: "multi" },
};
