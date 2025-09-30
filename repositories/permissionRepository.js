import db from "../models/index.js";

export default class PermissionRepository {
  constructor() {
    this.model = db.Permission;
  }

  // Create a permission
  async create(data) {
    return this.model.create(data);
  }

  // Find by name
  async findByName(name) {
    return this.model.findOne({attributes:['id',"permission_code"], where: { name } });
  }

  // Get all permissions
  async findAll() {
    return this.model.findAll({
      attributes: ["id", "name", "permission_code", ],
    });
  }
}
