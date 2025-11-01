import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import db, { Sequelize, remoteSequelize } from "../models/index.js";
import occasionFactoryModel from "../models/remote/occasion.js";
import AppError from "../utils/AppError.js";
import { MessageTemplateRepository } from "../repositories/messageTemplateRepo.js";
import { logger } from "../utils/logger.js";
import { toUpperCaseSafe } from "../utils/requiredMethods.js";

const OccasionModel = occasionFactoryModel(
  remoteSequelize,
  Sequelize.DataTypes
);

export const MessageTemplateService = {
  async changeStatus(id, status) {
    if (![0, 1].includes(Number(status))) {
      throw new AppError("Invalid status value. Use 0 or 1.", 400);
    }

    const transaction = await db.sequelize.transaction();

    try {
      const template = await MessageTemplateRepository.updateTemplateStatus(
        id,
        status,
        transaction
      );

      if (!template) {
        await transaction.rollback();
        throw new AppError("Message template not found", 404);
      }

      await transaction.commit();
      return template;
    } catch (error) {
      await transaction.rollback();
      logger.error("Error changing template status:", error);
      throw new AppError("Failed to change template status", 500);
    }
  },
  // ✅ CREATE TEMPLATE
  async createTemplate(req) {
    const {
      occasion_id,
      name,
      channel_id,
      language_code,
      category,
      template_type,
      components,
      placeholders,
      sender_id,
      template_code,
      template_format,
      status,
    } = req.body;

    // --- Basic validation ---
    if (
      !occasion_id ||
      !name ||
      !channel_id ||
      !language_code ||
      !template_code
    ) {
      throw new AppError("Missing required fields", 400);
    }

    // --- Check if name already exists (unique validation) ---
    const existingTemplate = await MessageTemplateRepository.findByName(name);
    if (existingTemplate) {
      throw new AppError("Template name must be unique", 409);
    }

    // --- Validate occasion ---
    const occasion = await MessageTemplateRepository.findOccasionById(
      OccasionModel,
      occasion_id
    );
    if (!occasion) throw new AppError("Occasion not found", 404);

    // --- Validate message channel ---
    const channel = await MessageTemplateRepository.findChannelById(channel_id);
    if (!channel) throw new AppError("Message channel not found", 404);

    // --- Parse JSON fields safely ---
    let parsedComponents = components;
    let parsedPlaceholders = placeholders;

    try {
      if (typeof components === "string")
        parsedComponents = JSON.parse(components);
      if (typeof placeholders === "string")
        parsedPlaceholders = JSON.parse(placeholders);
    } catch (err) {
      logger.warn(
        "Invalid JSON provided for components/placeholders. Stored as raw string."
      );
    }

    // --- Handle media (just metadata) ---
    let media_url = null;
    let media_uploaded_at = null;
    let media_id = null;
    let file_type = null;

    if (req.file) {
      const file = req.file;
      file_type = file.mimetype.split("/")[0];
      media_url = `local://uploads/${uuidv4()}_${file.originalname}`;
      media_uploaded_at = new Date();
      media_id = file.originalname;
    }

    // --- Transaction for safety ---
    const transaction = await db.sequelize.transaction();

    try {
      const newTemplate = await MessageTemplateRepository.createTemplate(
        {
          occasion_id,
          name,
          channel_id,
          language_code,
          category: toUpperCaseSafe(category) || null,
          template_type: template_type || null,
          components: parsedComponents,
          placeholders: parsedPlaceholders,
          sender_id: sender_id || null,
          media_url,
          media_id,
          template_code,
          template_format,
          media_uploaded_at,
          status: status || 1,
        },
        transaction
      );

      await transaction.commit();

      logger.info(`✅ Template "${name}" created successfully`);
      return { ...newTemplate.toJSON(), file_type };
    } catch (err) {
      await transaction.rollback();
      logger.error("❌ Failed to create template", err);
      throw new AppError("Failed to create template", 500);
    }
  },

  // ✅ GET FILTERED TEMPLATES
  async getAllTemplates(query) {
    const {
      occasion_id,
      channel_id,
      category,
      language_code,
      template_type,
      search,
      page = 1,
      limit = 10,
      sort_by = "created_at",
      order = "DESC",
    } = query;

    const where = {};

    if (occasion_id) where.occasion_id = occasion_id;
    if (channel_id) where.channel_id = channel_id;
    if (category) where.category = category;
    if (language_code) where.language_code = language_code;
    if (template_type) where.template_type = template_type;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { template_code: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { language_code: { [Op.like]: `%${search}%` } },
        { template_type: { [Op.like]: `%${search}%` } },
        { sender_id: { [Op.like]: `%${search}%` } },
      ];
    }

    const pagination = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    };

    const sorting = { sort_by, order };

    const templates = await MessageTemplateRepository.findTemplatesWithFilters(
      where,
      pagination,
      sorting
    );

    return {
      total: templates.count,
      page: parseInt(page),
      pages: Math.ceil(templates.count / limit),
      data: templates.rows,
    };
  },
};
