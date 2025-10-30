import { MessageTemplateService } from "../services/messageTemplateService.js";

export const createMessageTemplate = async (req, res) => {
  try {
    const newTemplate = await MessageTemplateService.createTemplate(req);
    return res.status(201).json({ success: true, data: newTemplate });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create message template",
    });
  }
};

export const getAllMessageTemplates = async (req, res) => {
  try {
    const result = await MessageTemplateService.getAllTemplates(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch message templates",
    });
  }
};

export const changeTemplateStatus = async (req, res) => {
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to change template status",
    });
  }
};
