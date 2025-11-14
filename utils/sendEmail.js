import { mailTransporter } from "../config/mail.js";

export const sendEmail = async (to, subject, html) => {
  return await mailTransporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};
