// occasionService.js
import * as occasionRepo from "../repositories/occasionRepository.js";
import OccasionResource from "../utils/occasionResource.js";

export const getAllOccasionsService = async () => {
  const occasions = await occasionRepo.findAllActiveOccasions();
  return OccasionResource.collection(occasions);
};
