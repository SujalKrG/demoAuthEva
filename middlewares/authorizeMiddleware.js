import db from "../models/index.js";

//permissionsToCheck = ['manageUsers', 'viewReports']
const authorize = (permissionsToCheck = []) => {
  return async (req, res, next) => {
    try {
      // get logged in user from req (set by authenticate middleware)
      const adminId = req.admin?.id;

      if (!adminId) {
        return res
          .status(401)
          .json({ success: false, message: "adminId not found" });
      }

      const admin = await db.Admin.findByPk(adminId, {
        attributes: ["id", "email"],
        include: [
          {
            model: db.Role,
            as: "roles",
            attributes: ["id", "code"],
            through: { attributes: [] },
            include: [
              {
                model: db.Permission,
                as: "permissions",
                attributes: ["id"],
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!admin) {
        return res
          .status(403)
          .json({ success: false, message: "admin not found" });
      }

      // superAdmin bypass → has all permissions
      const isSuper = (admin.roles || []).some(
        (r) => r.code.toUpperCase() === "SUPER_ADMIN"
      );
      if (isSuper) return next();

      //Collect unique permissionIds across all roles
      const userPermissionIds = new Set();
      (admin.roles || []).forEach((role) => {
        (role.permissions || []).forEach((perm) => {
          userPermissionIds.add(Number(perm.id));
        });
      });

      //check required permissions
      const hasAllRequired = (permissionsToCheck || []).every((id) =>
        userPermissionIds.has(Number(id))
      );

      if (!hasAllRequired) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Access denied: insufficient permissions",
          });
      }

      next();
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  };
};

export default authorize;
