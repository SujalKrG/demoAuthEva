import {
  findPermissionsByNames,
  bulkCreatePermissions,
  getAllPermissions
} from "../repositories/permissionRepository.js";
// import {capitalizeSentence} from "../utils/requiredMethods.js";


export const createPermissionsService = async (names) => {
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error("Permissions array is required");
  }

  // Normalize
  names = [...new Set(names.map((n) => n.trim()))];
  // names = capitalizeSentence(names);


  const existingPermissions = await findPermissionsByNames(names);
  const existingNames = existingPermissions.map((p) => p.name);

  const newNames = names.filter((n) => !existingNames.includes(n));

  if (newNames.length === 0) {
    return {
      added: [],
      skipped: names,
      message: "All provided permissions already exist",
    };
  }

  const newPermissions = await bulkCreatePermissions(newNames);

  return {
    added: newPermissions,
    skipped: existingNames,
    message: "Permissions processed successfully",
  };
};





export const getAllPermissionsService = async () => getAllPermissions();