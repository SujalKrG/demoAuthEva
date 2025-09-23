import { capitalizeSentence, slug } from "../utils/requiredMethods.js";
import {
  createThemeCategoryRepo,
  findThemeCategoryByIdRepo,
  updateThemeCategoryRepo,
  deleteThemeCategoryRepo,
  getAllThemeCategoriesRepo,
} from "../repositories/themeCategoryRepository.js";

export const createThemeCategoryService = async (data) => {
  if (!data.name || !data.type) {
    throw new Error("Name and type are required");
  }
  const newCategory = await createThemeCategoryRepo({
    name: capitalizeSentence(data.name),
    slug: slug(data.name),
    type: data.type,
    status: data.status ?? true,
  });
  return newCategory;
};

export const updateThemeCategoryService = async (id, data) => {
  const themeCategory = await findThemeCategoryByIdRepo(id);
  if (!themeCategory) {
    throw new Error("Theme category not found");
  }
  return await updateThemeCategoryRepo(
    themeCategory,
    ((data.name = capitalizeSentence(data.name)),
    (data.slug = slug(data.name)),
    data)
  );
};

export const deleteThemeCategoryService = async (id) => {
  const themeCategory = await findThemeCategoryByIdRepo(id);
  if (!themeCategory) {
    throw new Error("Theme category not found");
  }
  await deleteThemeCategoryRepo(themeCategory);
  return themeCategory;
};

export const getAllThemeCategoriesService = async (Sequelize) => {
  return await getAllThemeCategoriesRepo(Sequelize);
};
