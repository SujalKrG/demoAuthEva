// occasionService.js
import * as occasionRepo from "../repositories/occasionRepository.js";
import AppError from "../utils/AppError.js";
import OccasionResource from "../utils/occasionResource.js";

export const getAllOccasionsService = async () => {
  const occasions = await occasionRepo.findAllActiveOccasions();
  return OccasionResource.collection(occasions);
};
export const updateOccasionService = async (slug, updates) => {
  const occasion = await occasionRepo.findOccasionBySlug(slug);
  if (!occasion) {
    throw new AppError("Occasion not found", 404);
  }
  const allowedFields = [
    "event_profile_theme",
    "user_preview_theme",
    "title_suffix",
  ];
  const update = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      update[field] = updates[field];
    }
    if (Object.keys(update).length === 0)
      throw new AppError("No valid fields to update", 400);
  }

  const updatedOccasion = await occasionRepo.updateOccasion(occasion, update);
  return {
    id: updatedOccasion.id,
    slug: updatedOccasion.slug,
    event_profile_theme: updatedOccasion.event_profile_theme,
    user_preview_theme: updatedOccasion.user_preview_theme,
    title_suffix: updatedOccasion.title_suffix,
  };
};

export const occasionService = {
  findOccasionById: async (id) => {
    const occasion = await occasionRepo.findOccasionById(id);
    if (!occasion) {
      return null;
    }
    return new OccasionResource(occasion);
  },
}
