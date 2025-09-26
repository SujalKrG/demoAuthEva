import multer from "multer";
import db from "../models/index.js";
import { Op, where } from "sequelize";
import { logger } from "../utils/logger.js";
import { sequelize, Sequelize, remoteSequelize } from "../models/index.js";
import OccasionModelFactory from "../models/remote/occasion.js";
import CountryModelFactory from "../models/remote/country.js";
import { capitalizeSentence, slug } from "../utils/requiredMethods.js";
import { imageUploadQueue, videoUploadQueue } from "../jobs/queues.js";
import { deleteFileFromS3, sanitizeFileName } from "../middlewares/uploadS3.js";

const OccasionModel = OccasionModelFactory(
  remoteSequelize,
  Sequelize.DataTypes
);
const CountryModel = CountryModelFactory(remoteSequelize, Sequelize.DataTypes);

const storage = multer.memoryStorage();
export const upload = multer({ storage });
const normalizeDecimal = (val) => {
  if (val === undefined || val === null || val === "" || val === "null") {
    return null;
  }
  return Number(val);
};

export const createTheme = async (req, res) => {
  try {
    console.log("[createTheme] Incoming request:", req.body);

    const {
      occasion_id,
      category_id,
      name,
      component_name,
      config,
      base_price,
      offer_price,
      currency,
      status,
    } = req.body;

    // Basic validation
    if (!occasion_id || !category_id || !name) {
      return res.status(400).json({
        success: false,
        message: "occasion_id, category_id, and name are required",
      });
    }

    // Validate category
    const themeCategory = await db.ThemeCategory.findByPk(category_id);
    if (!themeCategory) {
      return res.status(400).json({
        success: false,
        message: "Theme category not found",
      });
    }
    const occasions = await OccasionModel.findByPk(occasion_id);
    if (!occasions) {
      return res.status(400).json({
        success: false,
        message: "Occasion not found",
      });
    }
    // const country_code = await CountryModel.findAll({
    //   attributes: [`${currency}`],
    // });
    // logger.info(country_code);

    // Generate slug (safe + unique)
    const themeSlug = slug(name) + "-" + Date.now();

    // Create DB record
    const theme = await db.Theme.create({
      occasion_id,
      category_id,
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

    console.log(
      `[createTheme] Theme created: id=${theme.id}, slug=${themeSlug}`
    );

    /**
     * Handle image upload (async via BullMQ)
     */
    if (req.files?.preview_image?.[0]) {
      try {
        const img = req.files.preview_image[0];
        await imageUploadQueue.add(
          "uploadImage",
          {
            themeId: theme.id,
            file: img.buffer.toString("base64"),
            filename: sanitizeFileName(img.originalname),
            mimetype: img.mimetype,
          },
          {
            attempts: 5,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: true,
            removeOnFail: 200,
          }
        );
        console.log(`[createTheme] Image job queued: themeId=${theme.id}`);
      } catch (err) {
        console.error("[createTheme] Failed to enqueue image job:", err);
      }
    } else {
      console.log("[createTheme] No preview_image provided");
    }

    /**
     * Handle video upload (only for video categories)
     */
    if (themeCategory.type === "video" && req.files?.preview_video?.[0]) {
      try {
        const vid = req.files.preview_video[0];
        await videoUploadQueue.add(
          "uploadVideo",
          {
            themeId: theme.id,
            file: vid.buffer.toString("base64"),
            filename: sanitizeFileName(vid.originalname),
            mimetype: vid.mimetype,
          },
          {
            attempts: 5,
            backoff: { type: "exponential", delay: 10000 },
            removeOnComplete: true,
            removeOnFail: 200,
          }
        );
        console.log(`[createTheme] Video job queued: themeId=${theme.id}`);
      } catch (err) {
        console.error("[createTheme] Failed to enqueue video job:", err);
      }
    } else {
      console.log(
        "[createTheme] No preview_video provided or category not video"
      );
    }
    logger.info("[createTheme] Theme created successfully");

    // Success response
    return res.status(201).json({
      success: true,
      message: "Theme created successfully. Media uploads are queued.",
      data: theme,
    });
  } catch (error) {
    console.error("[createTheme] Fatal error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating theme",
      error: error.message,
    });
  }
};

export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Theme ID is required" });
    }

    const theme = await db.Theme.findByPk(id);
    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme not found" });
    }

    const body = req.body;

    // validate category
    const themeCategories = await db.ThemeCategory.findByPk(
      body.category_id ?? theme.category_id
    );
    if (!themeCategories) {
      return res.status(400).json({
        success: false,
        message: "Theme category not found",
      });
    }

    const occasions = await OccasionModel.findByPk(
      body.occasion_id ?? theme.occasion_id
    );
    if (!occasions) {
      return res.status(400).json({
        success: false,
        message: "Occasion not found",
      });
    }

    // Prepare update object
    const updateData = {
      occasion_id: body.occasion_id ?? theme.occasion_id,
      category_id: body.category_id ?? theme.category_id,
      name: body.name ? capitalizeSentence(body.name) : theme.name,
      slug: body.name ? slug(body.name) : theme.slug, // Update slug if name changes
      component_name: body.component_name ?? theme.component_name,
      config: body.config ?? theme.config,
      base_price: normalizeDecimal(body.base_price) ?? theme.base_price,
      offer_price: normalizeDecimal(body.offer_price) ?? theme.offer_price,
      currency: body.currency ?? theme.currency,
      status: body.status ?? theme.status,
    };

    // update DB fields
    await theme.update(updateData);

    console.log(`[updateTheme] Theme updated successfully: id=${theme.id}`);

    /**
     * Handle media updates
     */
    // --- IMAGE ---
    if (req.files?.preview_image?.[0]) {
      try {
        if (theme.preview_image) {
          console.log(
            `[updateTheme] Deleting old image: ${theme.preview_image}`
          );
          await deleteFileFromS3(theme.preview_image);
        }

        const img = req.files.preview_image[0];
        await imageUploadQueue.add(
          "uploadImage",
          {
            themeId: theme.id,
            file: img.buffer.toString("base64"),
            filename: sanitizeFileName(img.originalname),
            mimetype: img.mimetype,
          },
          {
            attempts: 5,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: true,
            removeOnFail: 200,
          }
        );

        console.log(`[updateTheme] New image job queued: themeId=${theme.id}`);
      } catch (err) {
        console.error("[updateTheme] Error handling image:", err);
      }
    }

    // --- VIDEO ---
    if (themeCategories.type === "video" && req.files?.preview_video?.[0]) {
      try {
        if (theme.preview_video) {
          console.log(
            `[updateTheme] Deleting old video: ${theme.preview_video}`
          );
          await deleteFileFromS3(theme.preview_video);
        }

        const vid = req.files.preview_video[0];
        await videoUploadQueue.add(
          "uploadVideo",
          {
            themeId: theme.id,
            file: vid.buffer.toString("base64"),
            filename: sanitizeFileName(vid.originalname),
            mimetype: vid.mimetype,
          },
          {
            attempts: 5,
            backoff: { type: "exponential", delay: 10000 },
            removeOnComplete: true,
            removeOnFail: 200,
          }
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

    // --- Final response ---
    return res.status(200).json({
      success: true,
      message: "Theme updated successfully. Media uploads are queued.",
      data: theme,
    });
  } catch (error) {
    console.error("[updateTheme] Fatal error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating theme",
      error: error.message,
    });
  }
};

export const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await db.Theme.findByPk(id);
    if (!theme) return res.status(404).json({ message: "Theme not found" });

    // Delete from DB (paranoid = true, so soft delete)
    await theme.destroy();

    return res.status(200).json({ message: "Theme deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error deleting theme", error: error.message });
  }
};

export const getAllTheme = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, occasion, q } = req.query;
    const offset = (page - 1) * limit;
    const whereConditions = {};
    if (category) {
      whereConditions.category_id = category;
    }
    if (occasion) {
      whereConditions.occasion_id = occasion;
    }
    if (q && q.trim() !== "") {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { slug: { [Op.like]: `%${q}%` } },
        { component_name: { [Op.like]: `%${q}%` } },
        { currency: { [Op.like]: `%${q}%` } },
        { status: { [Op.like]: `%${q}%` } },
        { base_price: { [Op.like]: `%${q}%` } }, // number fields can also be searched as string
        { offer_price: { [Op.like]: `%${q}%` } },
      ];
    }
    // 1. Fetch themes from main DB
    const { rows: themes, count: total } = await db.Theme.findAndCountAll({
      where: whereConditions,
      attributes: [
        "id",
        "name",
        "slug",
        "occasion_id",
        "category_id",
        "status",
        "preview_image",
        "preview_video",
        "base_price",
        "offer_price",
        "currency",
        "component_name",
      ],
      include: [
        {
          model: db.ThemeCategory,
          as: "themeCategory",
          attributes: ["id", "name"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["created_at", "desc"]],
    });

    // 2. Fetch occasions from remote DB
    const occasionIds = themes.map((t) => t.occasion_id).filter(Boolean);

    const occasions = await OccasionModel.findAll({
      where: { id: { [Op.in]: occasionIds } },
      attributes: ["id", "name"],
    });

    const occasionMap = {};
    occasions.forEach((occ) => {
      occasionMap[occ.id] = occ.name;
    });

    // 3. Format response
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
      thumbnail: t.preview_image,
      preview_video: t.preview_video,
      component_name: t.component_name,
      base_price: t.base_price,
      offer_price: t.offer_price,
      currency: t.currency,
      status: t.status,
    }));

    return res.status(200).json({
      success: true,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching themes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch themes",
    });
  }
};

export const countryCode = async (req, res) => {
  try {
    const countries = await CountryModel.findAll({
      where: { status: 1 },
    });
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const theme = await db.Theme.findByPk(id);
    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme not found" });
    }

    await theme.update({ status });
    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};
