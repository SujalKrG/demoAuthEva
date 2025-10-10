import PermissionRepository from "../repositories/permissionRepository.js";
import { generatePermissionCode } from "../utils/requiredMethods.js";
const permissionRepo = new PermissionRepository();

// Utility to generate permission code

export default class PermissionService {
  // Create permission
  async createPermission({ name, router, method }) {
    if (!name || !router || !method) {
      throw new Error("Name, router, and method are required");
    }
    const permission_code = generatePermissionCode(name);

    const existing = await permissionRepo.findByName(permission_code);
    if (existing) {
      throw new Error("Permission with this name already exists");
    }

    const permission = await permissionRepo.create({
      name,
      router,
      method,
      permission_code,
    });
    return permission;
  }

  // Get all permissions
  async getAllPermissions() {
    return permissionRepo.findAll();
  }
}
