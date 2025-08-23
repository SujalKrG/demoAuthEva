const { Role, Permission, Admin } = require("../models");

//permissionsToCheck = ['manageUsers', 'viewReports']
const authorize = (permissionsToCheck = []) => {
  return async (req, res, next) => {
    try {
      // get logged in user from req (set by authenticate middleware)
      const userId = req.user.id;
      const user = await Admin.findByPk(userId, {
        include: [
          {
            model: Role,
            include: [Permission],
          },
        ],
      });

      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // collect all permissions of this user’s role
      const userPermissionIds = user.Role?.Permissions?.map((p) => p.id) || [];

      // superAdmin bypass → has all permissions
      if (user.Role.code.toUpperCase() === "SUPER") {
        return next();
      }

      //check required permissions
      const hasPermission = permissionsToCheck.every((id) =>
        userPermissionIds.includes(id)
      );

      if (!hasPermission) {
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
