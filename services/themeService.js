import { createTheme, updateThemeById, findThemeById, findThemes } from "../repositories/themeRepository.js";
import { imageUploadQueue, videoUploadQueue } from "../jobs/queues.js";
import { sanitizeFileName } from "../middlewares/uploadS3.js";
import { slug, capitalizeSentence } from "../utils/requiredMethods.js";

export const createThemeService = async (data, files) => {
  // Generate slug
  data.slug = slug(data.name) + "-" + Date.now();
  data.name = capitalizeSentence(data.name);

  // Create theme in DB
  const theme = await createTheme(data);

  // Handle media asynchronously
  if (files?.preview_image?.[0]) {
    const img = files.preview_image[0];
    await imageUploadQueue.add("uploadImage", {
      themeId: theme.id,
      file: img.buffer.toString("base64"),
      filename: sanitizeFileName(img.originalname),
      mimetype: img.mimetype,
    });
  }

  if (data.category_type === "video" && files?.preview_video?.[0]) {
    const vid = files.preview_video[0];
    await videoUploadQueue.add("uploadVideo", {
      themeId: theme.id,
      file: vid.buffer.toString("base64"),
      filename: sanitizeFileName(vid.originalname),
      mimetype: vid.mimetype,
    });
  }

  return theme;
};

export const updateThemeService = async (theme, updates, files, category_type) => {
  if (updates.name) updates.slug = slug(updates.name);

  await theme.update(updates);

  // Handle media updates similarly
  // enqueue new files if provided, delete old ones if necessary
  return theme;
};

export const getThemesService = async (query) => {
  const { page = 1, limit = 10, category, occasion, q } = query;
  const offset = (page - 1) * limit;

  const where = {};
  if (category) where.category_id = category;
  if (occasion) where.occasion_id = occasion;
  if (q) where.name = { [Op.like]: `%${q}%` };

  return findThemes({ where, limit: parseInt(limit), offset });
};
