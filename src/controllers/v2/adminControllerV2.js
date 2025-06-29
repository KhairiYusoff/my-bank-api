const User = require("../../models/User");
const { sendEmail } = require("../../utils/email");
const jwt = require("jsonwebtoken");
const { sendNotification } = require("../../services/notificationService");

// Admin updates a staff's role or status
exports.updateStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const adminId = req.user.id;
    const { role, status } = req.body;

    // Prevent self-update
    if (staffId === adminId) {
      return res
        .status(400)
        .json({ msg: "You cannot update your own role or status." });
    }

    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ msg: "Staff not found." });
    }
    if (staff.role !== "banker" && staff.role !== "admin") {
      return res
        .status(400)
        .json({
          msg: "Only staff (banker/admin) can be updated via this endpoint.",
        });
    }

    // Only allow allowed values
    const allowedRoles = ["banker", "admin"];
    const allowedStatus = ["active", "suspended", "terminated"];
    let updated = false;
    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ msg: "Invalid role." });
      }
      staff.role = role;
      updated = true;
    }
    if (status) {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ msg: "Invalid status." });
      }
      staff.status = status;
      updated = true;
    }
    if (!updated) {
      return res.status(400).json({ msg: "No valid fields to update." });
    }
    await staff.save();
    return res.json({ msg: "Staff updated successfully.", staff });
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Admin updates a customer's status
exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const adminId = req.user.id;
    const { status } = req.body;

    // Prevent self-update
    if (customerId === adminId) {
      return res
        .status(400)
        .json({ msg: "You cannot update your own status." });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ msg: "Customer not found." });
    }
    if (customer.role !== "customer") {
      return res
        .status(400)
        .json({ msg: "Only customers can be updated via this endpoint." });
    }

    // Only allow allowed status values
    const allowedStatus = ["active", "suspended", "terminated"];
    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({ msg: "Invalid or missing status." });
    }
    customer.status = status;
    await customer.save();
    return res.json({ msg: "Customer updated successfully.", customer });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Admin deletes a staff (banker) account
exports.deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const adminId = req.user.id;

    // Prevent self-deletion
    if (staffId === adminId) {
      return res
        .status(400)
        .json({ msg: "You cannot delete your own account." });
    }

    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ msg: "Staff not found." });
    }
    if (staff.role !== "banker") {
      return res
        .status(400)
        .json({
          msg: "Only banker accounts can be deleted via this endpoint.",
        });
    }
    // Prevent deleting another admin
    if (staff.role === "admin") {
      return res.status(400).json({ msg: "Cannot delete another admin." });
    }

    await User.deleteOne({ _id: staffId });
    return res.json({ msg: "Staff (banker) deleted successfully." });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Admin deletes a customer account
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const adminId = req.user.id;

    // Prevent self-deletion (should not be possible, but for safety)
    if (customerId === adminId) {
      return res
        .status(400)
        .json({ msg: "You cannot delete your own account." });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ msg: "Customer not found." });
    }
    if (customer.role !== "customer") {
      return res
        .status(400)
        .json({
          msg: "Only customer accounts can be deleted via this endpoint.",
        });
    }

    await User.deleteOne({ _id: customerId });
    return res.json({ msg: "Customer deleted successfully." });
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Banker/Admin gives final verification after customer completes their profile
exports.verifyCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.isProfileComplete) {
      return res
        .status(400)
        .json({
          msg: "Cannot verify. The user has not completed their profile yet.",
        });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "User is already verified." });
    }

    // Set final verification status
    user.isVerified = true;
    user.applicationStatus = "completed";

    await user.save();

    // Send a congratulatory email with login link
    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5190";
    const loginUrl = `${frontendUrl}/login`;

    await sendEmail({
      to: user.email,
      subject: "Congratulations! Your Bank Account is Now Active",
      text: `Dear ${user.name},\n\nCongratulations! Your bank account has been successfully verified and is now active.\n\nYou can now log in and start using your account by clicking the link below:\n\n${loginUrl}\n\nIf you did not request this, please contact us immediately.\n\nThank you for choosing My Bank.\n\nBest regards,\nMy Bank Team`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e5e5;background:#fafbfc;">
        <h2 style="color:#0a3d62;">Congratulations, ${user.name}!</h2>
        <p>Your bank account has been <b>successfully verified</b> and is now active.</p>
        <p style="margin:18px 0;">You can now log in and start using your account by clicking the button below:</p>
        <p><a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#0a3d62;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Log In to My Bank</a></p>
        <p>If you did not request this, please contact us immediately.</p>
        <p style="margin-top:32px;">Thank you for choosing <b>My Bank</b>.<br/>Best regards,<br/>My Bank Team</p>
      </div>`,
    });

    res.json({
      msg: "Customer has been successfully verified and their account is now active.",
    });
  } catch (err) {
    console.error("Error verifying customer:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Banker/Admin approves an initial application
exports.approveApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "User application not found" });
    }

    if (user.applicationStatus !== "pending") {
      return res
        .status(400)
        .json({ msg: `Application is already ${user.applicationStatus}` });
    }

    // Update application status
    user.applicationStatus = "approved";

    // Generate a secure token for the user to complete their profile
    // This token is short-lived and has a specific purpose
    const profileCompletionToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, // Using the main JWT secret, but could use a different one
      { expiresIn: "24h" } // Link expires in 24 hours
    );

    // Get frontend URL from environment variable or use default
    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5190";
    const completeProfileUrl = `${frontendUrl}/complete-profile?token=${profileCompletionToken}`;

    // Send an email to the user with the link to complete their profile
    await sendEmail({
      to: user.email,
      subject: "Your Bank Application: Next Steps",
      text: `Dear ${user.name},\n\nCongratulations! Your application has been approved. Please complete your profile by clicking the link below:\n\n${completeProfileUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not request this, please contact us immediately.\n\nThank you for choosing My Bank.\n\nBest regards,\nMy Bank Team`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e5e5;background:#fafbfc;">
        <h2 style="color:#0a3d62;">Congratulations, ${user.name}!</h2>
        <p>Your bank application has been <b>approved</b>.</p>
        <p style="margin:18px 0;">To activate your account, please complete your profile by clicking the button below:</p>
        <p><a href="${completeProfileUrl}" style="display:inline-block;padding:12px 24px;background:#0a3d62;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Complete Your Profile</a></p>
        <p><b>This link will expire in 24 hours.</b></p>
        <p>If you did not request this, please contact us immediately.</p>
        <p style="margin-top:32px;">Thank you for choosing <b>My Bank</b>.<br/>Best regards,<br/>My Bank Team</p>
      </div>`,
    });

    await user.save();

    res.json({
      msg: "Application approved. An email has been sent to the user to complete their profile.",
      userId: user._id,
    });
  } catch (err) {
    console.error("Error approving application:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};
