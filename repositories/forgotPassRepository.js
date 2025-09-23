import db from "../models/index.js";

export const findAdminByEmail = (email) =>
  db.Admin.findOne({ where: { email } });

export const findAdminById = (id) =>
  db.Admin.findByPk(id);

export const findAdminsWithValidOTP = () =>
  db.Admin.findAll({
    where: { resetPasswordOTPExpires: { [Op.gt]: new Date() } },
  });

export const saveAdmin = (admin) =>
  admin.save();
