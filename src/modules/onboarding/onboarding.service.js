const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/email");

const generateProfileCompletionToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

const buildProfileCompletionUrl = (userId) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5190";
  const token = generateProfileCompletionToken(userId);
  return { token, url: `${frontendUrl}/complete-profile?token=${token}` };
};

const sendApprovalEmail = async ({ email, name, completeProfileUrl }) => {
  await sendEmail({
    to: email,
    subject: "Your Bank Application: Next Steps",
    text: `Dear ${name},\n\nYour application has been approved. Complete your profile here:\n\n${completeProfileUrl}\n\nThis link expires in 24 hours.\n\nMy Bank Team`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e5e5;background:#fafbfc;">
      <h2 style="color:#0a3d62;">Congratulations, ${name}!</h2>
      <p>Your bank application has been <b>approved</b>.</p>
      <p style="margin:18px 0;">Complete your profile to activate your account:</p>
      <p><a href="${completeProfileUrl}" style="display:inline-block;padding:12px 24px;background:#0a3d62;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Complete Your Profile</a></p>
      <p><b>This link will expire in 24 hours.</b></p>
      <p style="margin-top:32px;">Thank you for choosing <b>My Bank</b>.<br/>My Bank Team</p>
    </div>`,
  });
};

const sendActivationEmail = async ({ email, name }) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5190";
  await sendEmail({
    to: email,
    subject: "Congratulations! Your Bank Account is Now Active",
    text: `Dear ${name},\n\nYour bank account is now active. Log in here: ${frontendUrl}/login\n\nMy Bank Team`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e5e5;background:#fafbfc;">
      <h2 style="color:#0a3d62;">Congratulations, ${name}!</h2>
      <p>Your bank account has been <b>successfully verified</b> and is now active.</p>
      <p style="margin:18px 0;"><a href="${frontendUrl}/login" style="display:inline-block;padding:12px 24px;background:#0a3d62;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Log In to My Bank</a></p>
      <p style="margin-top:32px;">Thank you for choosing <b>My Bank</b>.<br/>My Bank Team</p>
    </div>`,
  });
};

module.exports = {
  buildProfileCompletionUrl,
  sendApprovalEmail,
  sendActivationEmail,
};
