import {
  countryCodeRepo,
  findThemeWithCategory,
  updateThemeStatusRepo,
  getThemesRepo,
  createThemeRepo,
  findOccasionById,
  findThemeCategoryById,
  updateThemeRepo,
  findThemeTypeRepo,
} from "../repositories/themeRepository.js";
import OccasionModelFactory from "../models/remote/occasion.js";
const OccasionModel = OccasionModelFactory(
  remoteSequelize,
  Sequelize.DataTypes
);
import db from "../models/index.js";
import {
  slug,
  capitalizeSentence,
  sanitizeFileName,
  normalizeDecimal,
} from "../utils/requiredMethods.js";
import { remoteSequelize, Sequelize } from "../models/index.js";
import { deleteFileFromS3, uploadFileToS3 } from "../middlewares/uploadS3.js";

import { Op } from "sequelize";
import { IdempotencyParameterMismatch } from "@aws-sdk/client-s3";

export const countryCodeService = async () => countryCodeRepo();

export const updateThemeStatusService = async (id, status, admin) => {
  if (![true, false, 0, 1].includes(status)) throw new Error("Invalid status");

  const theme = await findThemeWithCategory(id);
  if (!theme) throw new Error("Theme not found");

  // Transaction optional if multiple related updates
  await updateThemeStatusRepo(theme, status);

  // Logging for audit trail
  // await logActivity({
  //   created_by: admin.id,
  //   action: `Theme status updated by ${admin.name} (${admin.emp_id})`,
  //   module: "theme",
  //   details: { id: theme.id, name: theme.name, status },
  // });

  return theme;
};

export const getAllThemeService = async (query) => {
  const { page = 1, limit = 10, category, occasion, q } = query;
  const offset = (page - 1) * limit;

  const whereConditions = {};
  if (category) whereConditions.category_id = category;
  if (occasion) whereConditions.occasion_id = occasion;
  // if(themeType) whereConditions.theme_type_id = themeType;

  if (q && q.trim() !== "") {
    whereConditions[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { slug: { [Op.like]: `%${q}%` } },
      { component_name: { [Op.like]: `%${q}%` } },
      { currency: { [Op.like]: `%${q}%` } },
      { status: { [Op.like]: `%${q}%` } },
      { base_price: { [Op.like]: `%${q}%` } },
      { offer_price: { [Op.like]: `%${q}%` } },
    ];
  }

  // Fetch themes from main DB
  const { rows: themes, count: total } = await getThemesRepo(
    whereConditions,
    parseInt(limit),
    offset
  );

  // Fetch occasions from remote DB
  const occasionIds = themes.map((t) => t.occasion_id).filter(Boolean);
  const occasions = await OccasionModel.findAll({
    where: { id: { [Op.in]: occasionIds } },
    attributes: ["id", "name"],
  });

  const occasionMap = {};
  occasions.forEach((occ) => {
    occasionMap[occ.id] = occ.name;
  });

  // Format response
  const result = themes.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    occasion: {
      id: t.occasion_id,
      name: occasionMap[t.occasion_id]?.replace(/^"|"$/g, "") || null,
    },
    theme_category: {
      id: t.category_id,
      name: t.themeCategory ? t.themeCategory.name : null,
    },
    theme_type: {
      id: t.theme_type_id,
      name: t.themeType ? t.themeType.name : null,
    },
    thumbnail: t.preview_image,
    preview_video: t.preview_video,
    component_name: t.component_name,
    base_price: t.base_price,
    offer_price: t.offer_price,
    currency: t.currency,
    status: t.status,
  }));

  return {
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    limit,
    count: result.length,
    data: result,
  };
};

export const createThemeService = async (data, files) => {
  const {
    occasion_id,
    category_id,
    theme_type_id,
    name,
    component_name,
    config,
    base_price,
    offer_price,
    currency,
    status,
  } = data;

  if (!occasion_id || !category_id || !name) {
    throw new Error("Missing required fields");
  }
  const themeCategory = await findThemeCategoryById(category_id);
  if (!themeCategory) {
    throw new Error("Theme category not found");
  }
  const themeType = await findThemeTypeRepo(theme_type_id);
  if (!themeType) {
    throw new Error("Theme type not found");
  }
  const occasions = await findOccasionById(occasion_id);
  if (!occasions) {
    throw new Error("Occasion not found");
  }

  const theme = await createThemeRepo({
    occasion_id,
    category_id,
    theme_type_id,
    name: capitalizeSentence(name),
    slug: slug(name),
    component_name: component_name || null,
    config: config || {},
    base_price: base_price || 0,
    offer_price: offer_price || null,
    currency: currency || "INR",
    status: status ?? true,
    preview_image: null,
    preview_video: null,
  });
  if (files?.preview_image?.[0]) {
    const file = files.preview_image[0];
    const imageUrl = await uploadFileToS3(
      file.buffer,
      "images",
      sanitizeFileName(file.originalname),
      file.mimetype
    );
    await db.Theme.update(
      { preview_image: imageUrl },
      { where: { id: theme.id } }
    );
  } else {
    console.log("[createTheme] No preview_image provided");
  }

  if (themeCategory.type === "video" && files?.preview_video?.[0]) {
    const file = files.preview_video[0];
    const videoUrl = await uploadFileToS3(
      file.buffer,
      "videos",
      sanitizeFileName(file.originalname),
      file.mimetype
    );
    await db.Theme.update(
      { preview_video: videoUrl },
      { where: { id: theme.id } }
    );
  } else {
    console.log(
      "[createTheme] No preview_video provided or category not video"
    );
  }
  return theme;
};

export const updateThemeService = async (id, body, files) => {
  if (!id) {
    throw new Error("Invalid request");
  }
  const theme = await findThemeWithCategory(id);
  if (!theme) {
    throw new Error("Theme not found");
  }
  const themeCategories = await findThemeCategoryById(
    body.category_id ?? theme.category_id
  );
  if (!themeCategories) {
    throw new Error("Theme category not found");
  }
  const occasions = await findOccasionById(
    body.occasion_id ?? theme.occasion_id
  );
  if (!occasions) {
    throw new Error("Occasion not found");
  }
  const updateData = {
    occasion_id: body.occasion_id ?? theme.occasion_id,
    category_id: body.category_id ?? theme.category_id,
    theme_type_id: body.theme_type_id ?? theme.theme_type_id,
    name: body.name ? capitalizeSentence(body.name) : theme.name,
    slug: body.name ? slug(body.name) : theme.slug,
    component_name: body.component_name ?? theme.component_name,
    config: body.config ?? theme.config,
    base_price: body.base_price ?? theme.base_price,
    offer_price: normalizeDecimal(body.offer_price ?? theme.offer_price),
    currency: body.currency ?? theme.currency,
    status: body.status ?? theme.status,
  };
  await updateThemeRepo(theme, updateData);

  if (files?.preview_image?.[0]) {
    try {
      if (theme.preview_image) {
        console.log(`[updateTheme] Deleting old image: ${theme.preview_image}`);
        await deleteFileFromS3(theme.preview_image);
      }

      const file = files.preview_image[0];
      const imageUrl = await uploadFileToS3(
        file.buffer,
        "images",
        sanitizeFileName(file.originalname),
        file.mimetype
      );
      await db.Theme.update(
        { preview_image: imageUrl },
        { where: { id: theme.id } }
      );

      console.log(`[updateTheme] New image job queued: themeId=${theme.id}`);
    } catch (err) {
      console.error("[updateTheme] Error handling image:", err);
    }
  }

  // --- VIDEO ---
  if (themeCategories.type === "video" && files?.preview_video?.[0]) {
    try {
      if (theme.preview_video) {
        console.log(`[updateTheme] Deleting old video: ${theme.preview_video}`);
        await deleteFileFromS3(theme.preview_video);
      }

      const file = files.preview_video[0];
      const videoUrl = await uploadFileToS3(
        file.buffer,
        "videos",
        sanitizeFileName(file.originalname),
        file.mimetype
      );
      await db.Theme.update(
        { preview_video: videoUrl },
        { where: { id: theme.id } }
      );

      console.log(`[updateTheme] New video job queued: themeId=${theme.id}`);
    } catch (err) {
      console.error("[updateTheme] Error handling video:", err);
    }
  } else if (themeCategories.type !== "video") {
    console.log(
      `[updateTheme] Skipping video upload (type=${themeCategories.type})`
    );
  }
  return theme;
};
