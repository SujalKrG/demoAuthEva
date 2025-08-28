const { Role, Permission, Admin } = require("../models");

//permissionsToCheck = ['manageUsers', 'viewReports']
const authorize = (permissionsToCheck = []) => {
  return async (req, res, next) => {
    try {
      // get logged in user from req (set by authenticate middleware)
      const userId = req.admin?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const admin = await Admin.findByPk(userId, {
        attributes: ["id", "email"],
        include: [
          {
            model: Role,
            as: "roles",
            attributes: ["id", "code"],
            through: { attributes: [] },
            include: [
              {
                model: Permission,
                as: "permissions",
                attributes: ["id"],
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!admin) {
        return res.status(403).json({ message: "User not found" });
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
          .json({ message: "Access denied: insufficient permissions" });
      }

      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = authorize;
