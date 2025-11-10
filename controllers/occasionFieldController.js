// occasionFieldController.js
import {
  createOccasionFieldsService,
  updateOccasionFieldService,
  deleteOccasionFieldService,
  getAllOccasionFieldsService,
  getOccasionFieldsByIdService,
} from "../services/occasionFieldService.js";
import { logger } from "../utils/logger.js";

export const createOccasionField = async (req, res, next) => {
  try {
    const data = await createOccasionFieldsService(req.body, req.admin?.id);
    res.status(201).json({
      success: true,
      message: `${data.length} Occasion field(s) created successfully`,
      data,
    });
  } catch (error) {
    logger.error(`[occasion field][create] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
export const updateOccasionField = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await updateOccasionFieldService(
      id,
      req.body,
      req.admin?.id
    );

    if (!updated)
      return res.status(404).json({
        success: false,
        message: "Occasion field not found or no changes made",
      });

    res.status(200).json({
      success: true,
      message: `Occasion field with ID (${id}) updated successfully`,
    });
  } catch (error) {
    logger.error(`[occasion field][update] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const deleteOccasionField = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteOccasionFieldService(id, req.admin?.id);
    if (!deleted)
      return res.status(404).json({ message: "Occasion field not found" });
    res
      .status(200)
      .json({ message: `Occasion field with ID (${id}) deleted successfully` });
  } catch (error) {
    logger.error(`[occasion field][delete] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const getAllOccasionFields = async (req, res) => {
  try {
    const data = await getAllOccasionFieldsService();
    res.json(data);
  } catch (error) {
    handleSequelizeError(error, res);
  }
};

export const getOccasionFieldsById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getOccasionFieldsByIdService(id);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "No occasion fields found" });
    res.status(200).json(data);
  } catch (error) {
    logger.error(`[occasion field][getById] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
