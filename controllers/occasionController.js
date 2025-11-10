// occasionController.js
import {
  getAllOccasionsService,
  updateOccasionService,
  occasionService,
} from "../services/occasionService.js";
import { logger } from "../utils/logger.js";

export const getOccasions = async (req, res, next) => {
  try {
    const data = await getAllOccasionsService();
    res.json(data);
  } catch (error) {
    logger.error(`[occasion][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const updateOccasion = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updates = req.body;
    const updatedOccasion = await updateOccasionService(slug, updates);
    res.status(200).json({
      success: true,
      message: "Occasion updated successfully",
      data: updatedOccasion,
    });
  } catch (error) {
    logger.error(`[occasion][update] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const getOccasionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const occasion = await occasionService.findOccasionById(id);
    if (!occasion) {
      return next(new AppError("Occasion not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Occasion fetched successfully",
      data: occasion,
    });
  } catch (error) {
    logger.error(`[occasion][getById] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
