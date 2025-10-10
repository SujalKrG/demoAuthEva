import db from "../models/index.js";
import { Op } from "sequelize";

export const findAdminByEmail = (email) =>
  db.Admin.findOne({ where: { email } });

export const findAdminById = (id) => db.Admin.findByPk(id);

export const findAdminWithValidOTP = (email) =>
  db.Admin.findOne({
    where: {
      email,
      reset_password_OTP_expire: { [Op.gt]: new Date() },
    },
  });

export const saveAdmin = (admin) => admin.save();
