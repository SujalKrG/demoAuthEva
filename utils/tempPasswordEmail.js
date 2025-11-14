export const tempPasswordEmailTemplate = (name, tempPassword) => {
  return `
    <h2>Hello ${name},</h2>
    <p>Your Super Admin has reset your password.</p>
    
    <p>Your temporary password is:</p>

    <h3 style="color: #333;">${tempPassword}</h3>

    <p>This password will expire in <b>24 hours</b>. You must log in and change your password immediately.</p>

    <p>If you did not request this reset, contact support.</p>
    <br/>
    <p>Best Regards,<br/>Your Team</p>
  `;
};
