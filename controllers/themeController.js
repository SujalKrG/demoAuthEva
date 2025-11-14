import multer from "multer";
import { logger } from "../utils/logger.js";
import logActivity from "../utils/logActivity.js";

import {
  countryCodeService,
  updateThemeStatusService,
  getAllThemeService,
  createThemeService,
  updateThemeService,
} from "../services/themeService.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const updateTheme = async (req, res, next) => {
  try {
    const theme = await updateThemeService(req.params.id, req.body, req.files);
    await logActivity({
      created_by: req.admin.id,
      action: `Themes updated by Admin ${req.admin.name} (${req.admin.emp_id})`,
      module: "theme",
      details: {
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        occasion_id: theme.occasion_id,
        category_id: theme.category_id,
        status: theme.status,
        preview_image: theme.preview_image,
        preview_video: theme.preview_video,
        base_price: theme.base_price,
        offer_price: theme.offer_price,
        currency: theme.currency,
        component_name: theme.component_name,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Theme updated successfully",
    });
  } catch (error) {
    logger.error(`[Theme][update] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const createTheme = async (req, res, next) => {
  try {
    const theme = await createThemeService(req.body, req.files);
    await logActivity({
      created_by: req.admin.id,
      action: `Themes created by Admin ${req.admin.name} (${req.admin.emp_id})`,
      module: "theme",
      details: {
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        occasion_id: theme.occasion_id,
        category_id: theme.category_id,
        status: theme.status,
        preview_image: theme.preview_image,
        preview_video: theme.preview_video,
        base_price: theme.base_price,
        offer_price: theme.offer_price,
        currency: theme.currency,
        component_name: theme.component_name,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Theme created successfully",
      data: theme,
    });
  } catch (error) {
    logger.error(`[Theme][create] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const countryCode = async (req, res, next) => {
  try {
    const country = await countryCodeService();
    return res.status(200).json(country);
  } catch (error) {
    logger.error(`[country code(theme controller)][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const theme = await updateThemeStatusService(id, status, req.admin);
    await logActivity({
      created_by: req.admin.id,
      action: `Theme status updated by Admin ${req.admin.name} (${req.admin.emp_id})`,
      module: "theme",
      details: {
        id: theme.id,
        name: theme.name,
        status: theme.status,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Theme status updated successfully",
      data: { id: theme.id, status: theme.status },
    });
  } catch (error) {
    logger.error(`[Theme][update status] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const getAllTheme = async (req, res, next) => {
  try {
    const data = await getAllThemeService(req.query);
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    logger.error(`[Theme][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
