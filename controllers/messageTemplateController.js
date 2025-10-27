import db from "../models/index.js";
const { MessageTemplate, MessageChannel } = db;

// 🟩 Create a new Message Template
export const createMessageTemplate = async (req, res) => {
  try {
    const data = req.body;

    const newTemplate = await MessageTemplate.create(data);
    return res.status(201).json({
      success: true,
      message: "Message template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    console.error("Error creating message template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create message template",
      error: error.message,
    });
  }
};

// 🟦 Get all Message Templates
export const getAllMessageTemplates = async (req, res) => {
  try {
    const templates = await MessageTemplate.findAll({
      include: [
        {
          model: MessageChannel,
          as: "channel",
          attributes: ["id", "name", "code"], // optional
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch message templates",
      error: error.message,
    });
  }
};
