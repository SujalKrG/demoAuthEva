import { s3Client } from "../../config/s3.js";
import db from "../../models/index.js";
import slugify from "slugify";
import multer from "multer";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  uploadFileToS3,
  deleteFileFromS3,
  sanitizeFileName,
} from "../../middlewares/uploadS3.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const slug = (name) => {
  return (
    slugify(name, { lower: true, strict: true }) +
    "-" +
    Date.now().toString().slice(-6)
  );
};

export const createTheme = async (req, res) => {
  try {
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

    // Generate slug

    let previewImageUrl = null;
    let previewVideoUrl = null;

    if (req.files?.preview_image?.[0]) {
      const imageFile = req.files.preview_image[0];
      previewImageUrl = await uploadFileToS3(
        imageFile.buffer,
        "images",
        sanitizeFileName(imageFile.originalname),
        imageFile.mimetype
      );
    }

    if (req.files?.preview_video?.[0]) {
      const videoFile = req.files.preview_video[0];
      previewVideoUrl = await uploadFileToS3(
        videoFile.buffer,
        "videos",
        sanitizeFileName(videoFile.originalname),
        videoFile.mimetype
      );
    }

    // Save in DB
    const theme = await db.Theme.create({
      occasion_id,
      category_id,
      name,
      slug: slug(name),
      component_name,
      config,
      base_price,
      offer_price,
      currency,
      status,
      preview_image: previewImageUrl,
      preview_video: previewVideoUrl,
    });

    return res.status(201).json({
      message: "Theme created successfully",
      theme,
    });
  } catch (error) {
    console.error("Error creating theme:", error);
    return res.status(500).json({ message: "Error creating theme", error });
  }
};

export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await db.Theme.findByPk(id);
    if (!theme) return res.status(404).json({ message: "Theme not found" });

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

    // Update S3 files if new files are uploaded
    if (req.files?.preview_image?.[0]) {
      // Delete old image
      await deleteFileFromS3(theme.preview_image);

      const imageFile = req.files.preview_image[0];
      theme.preview_image = await uploadFileToS3(
        imageFile.buffer,
        "images",
        imageFile.originalname,
        imageFile.mimetype
      );
    }

    if (req.files?.preview_video?.[0]) {
      await deleteFileFromS3(theme.preview_video);

      const videoFile = req.files.preview_video[0];
      theme.preview_video = await uploadFileToS3(
        videoFile.buffer,
        "videos",
        videoFile.originalname,
        videoFile.mimetype
      );
    }

    // Update other fields
    theme.occasion_id = occasion_id ?? theme.occasion_id;
    theme.category_id = category_id ?? theme.category_id;
    theme.name = name ?? theme.name;
    if (name) theme.slug = slug(name);
    theme.component_name = component_name ?? theme.component_name;
    theme.config = config ?? theme.config;
    theme.base_price = base_price ?? theme.base_price;
    theme.offer_price = offer_price ?? theme.offer_price;
    theme.currency = currency ?? theme.currency;
    theme.status = status ?? theme.status;

    await theme.save();

    return res
      .status(200)
      .json({ message: "Theme updated successfully", theme });
  } catch (error) {
    console.error(error);
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;
    return res
      .status(500)
      .json({ message: "Error updating theme", error: error.message });
  }
};

export const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await db.Theme.findByPk(id);
    if (!theme) return res.status(404).json({ message: "Theme not found" });

    // Delete files from S3
    await deleteFileFromS3(theme.preview_image);
    await deleteFileFromS3(theme.preview_video);

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
