import {
  findPermissionsByNames,
  bulkCreatePermissions,
  getAllPermissions
} from "../repositories/permissionRepository.js";

export const createPermissionsService = async (names) => {
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error("Permissions array is required");
  }

  // Normalize: lowercase + trim + deduplicate
  names = [...new Set(names.map((n) => n.trim().toLowerCase()))];

  // Check existing
  const existingPermissions = await findPermissionsByNames(names);
  const existingNames = existingPermissions.map((p) => p.name);

  // Filter out existing ones
  const newNames = names.filter((n) => !existingNames.includes(n));

  if (newNames.length === 0) {
    return {
      added: [],
      skipped: names,
      message: "All provided permissions already exist",
    };
  }

  // Bulk insert new permissions
  const newPermissions = await bulkCreatePermissions(newNames);

  return {
    added: newPermissions,
    skipped: existingNames,
    message: "Permissions processed successfully",
  };
};



export const getAllPermissionsService = async () => getAllPermissions();