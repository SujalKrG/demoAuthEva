import { MessageTemplateService } from "../services/messageTemplateService.js";
import { logger } from "../utils/logger.js";

export const createMessageTemplate = async (req, res, next) => {
  try {
    const newTemplate = await MessageTemplateService.createTemplate(req);
    return res.status(201).json({ success: true, data: newTemplate });
  } catch (error) {
    logger.error(`[message template][create] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const getAllMessageTemplates = async (req, res, next) => {
  try {
    const result = await MessageTemplateService.getAllTemplates(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    logger.error(`[message template][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const updateMessageTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedTemplate = await MessageTemplateService.updateTemplate(
      id,
      req
    );
    return res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error) {
    logger.error(`[message template][update] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const changeTemplateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTemplate = await MessageTemplateService.changeStatus(
      id,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Template status updated successfully",
      data: {
        id: updatedTemplate.id,
        status: updatedTemplate.status,
      },
    });
  } catch (error) {
    logger.error(`[message template][change status] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await MessageTemplateService.getTemplateById(id);
    return res.status(200).json({ success: true, data: template });
  } catch (error) {
    logger.error(`[message template][getById] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
