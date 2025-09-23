// occasionFieldService.js
import db from "../models/index.js";
import * as occasionFieldRepo from "../repositories/occasionFieldRepository.js";
import OccasionResource from "../utils/occasionResource.js";

// Helper: normalize & validate data
const normalizeOccasionFieldData = (rawData) => {
  const data = Array.isArray(rawData) ? rawData : [rawData];

  return data.map((item) => {
    const normalized = {};
    for (const k in item) {
      normalized[k] = typeof item[k] === "string" ? item[k].trim() : item[k];
    }

    if (normalized.occasion_id != null) normalized.occasion_id = Number(normalized.occasion_id);
    if (normalized.order_no != null) normalized.order_no = Number(normalized.order_no);

    if (typeof normalized.required === "string") {
      const s = normalized.required.toLowerCase();
      normalized.required = s === "true" || s === "1" || s === "yes";
    }

    if (typeof normalized.options === "string") {
      try {
        const parsed = JSON.parse(normalized.options);
        normalized.options = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        normalized.options = normalized.options.split(",").map((x) => x.trim());
      }
    }

    return normalized;
  });
};

// Create multiple occasion fields
export const createOccasionFieldsService = async (rawData, adminId) => {
  const data = normalizeOccasionFieldData(rawData);

  return db.sequelize.transaction(async (t) => {
    await occasionFieldRepo.bulkCreateOccasionFields(data, t, adminId);
    return data;
  });
};

// Update, Delete, Fetch
export const updateOccasionFieldService = (id, updates, adminId) =>
  occasionFieldRepo.updateOccasionFieldById(id, updates, adminId);

export const deleteOccasionFieldService = (id, adminId) =>
  occasionFieldRepo.deleteOccasionFieldById(id, adminId);

export const getAllOccasionFieldsService = async () => {
  const occasions = await occasionFieldRepo.findAllActiveOccasions();
  const fields = await occasionFieldRepo.findAllOccasionFields();

  const normalizedOccasions = OccasionResource.collection(occasions);

  return normalizedOccasions.map((occasion) => {
    const relatedFields = fields.filter((f) => f.occasion_id === occasion.occasionId);
    return {
      ...occasion,
      formFields: relatedFields.map((f) => ({
        formFieldId: f.id,
        fieldKey: f.field_key,
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options,
        orderNo: f.order_no,
      })),
    };
  });
};

export const getOccasionFieldsByIdService = async (id) => {
  const occasion = await occasionFieldRepo.findOccasionById(id);
  if (!occasion) return null;

  const fields = await occasionFieldRepo.findAllOccasionFields();
  const relatedFields = fields.filter((f) => f.occasion_id === id);

  return {
    ...new OccasionResource(occasion),
    formFields: relatedFields.map((f) => ({
      formFieldId: f.id,
      fieldKey: f.field_key,
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.options,
      orderNo: f.order_no,
    })),
  };
};
