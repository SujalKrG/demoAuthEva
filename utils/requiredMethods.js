import slugify from "slugify";
import path from "path";
import jwt from "jsonwebtoken";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { Op } from "sequelize";

// Capitalize each word
export const capitalizeSentence = (sentence = "") => {
  return sentence
    .toLowerCase()
    .split(" ")
    .filter((word) => word.trim() !== "")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Slugify name with unique suffix
export const slug = (name) => {
  return (
    slugify(name, { lower: true, strict: true }) +
    "-" +
    Date.now().toString().slice(-6)
  );
};

// Sanitize file name
export const sanitizeName = (name) => {
  const ext = path.extname(name) || "";
  const base = path.basename(name, ext);
  return slugify(base, { lower: true, strict: true }) + ext.toLowerCase();
};

// Validation error helper
export const validationError1 = async (t, message) => {
  if (t) await t.rollback();
  throw new Error(message);
};

// Generate sequential emp_id: EMP<YY><SEQ>
export const generateEmpId = async (transaction) => {
  // Lock the admins table to prevent race conditions
  const lastAdmin = await sequelize.models.Admin.findOne({
    order: [["created_at", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE, // <--- prevents concurrent inserts from duplicating emp_id
  });

  let lastId = lastAdmin ? parseInt(lastAdmin.emp_id?.split("-")[1]) : 0;
  let newId = lastId + 1;
  return `adm-${newId.toString().padStart(4, "0")}`;
};

// JWT generator
export const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

// Generate permission code
export const generatePermissionCode = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

// utils/formatDate.js
export const formatToIST = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};
export const normalizeDecimal = (val) => {
  if (val === undefined || val === null || val === "" || val === "null") {
    return null;
  }
  return Number(val);
};
export const sanitizeFileName = (filename) => {
  return filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
};