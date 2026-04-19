const User = require("../../shared/models/User");
const Account = require("../../shared/models/Account");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../../shared/utils/email");
const { sendNotification } = require("../../shared/services/notificationService");
const { success, error } = require("../../shared/utils/response");

// Only Admins Can Create Other Admins & Bankers
exports.createStaff = async (req, res) => {
  const { name, email, password, role } = req.body;

  const validRoles = ["admin", "banker"];
  if (!validRoles.includes(role)) {
    return error(res, { message: "Invalid role assignment", statusCode: 400 });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return error(res, {
        message: "User with this email already exists",
        statusCode: 400,
      });
    }

    user = new User({
      name,
      email,
      password,
      role,
      isVerified: true,
      isProfileComplete: true,
    });

    await user.save();
    return success(res, {
      message: `${role} created successfully.`,
      statusCode: 201,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin updates a staff's role or status
exports.updateStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const adminId = req.user.id;
    const { role, status } = req.body;

    if (staffId === adminId) {
      return res.status(400).json({ msg: "You cannot update your own role or status." });
    }

    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ msg: "Staff not found." });
    if (staff.role !== "banker" && staff.role !== "admin") {
      return res.status(400).json({ msg: "Only staff (banker/admin) can be updated via this endpoint." });
    }

    const allowedRoles = ["banker", "admin"];
    const allowedStatus = ["active", "suspended", "terminated"];
    let updated = false;

    if (role) {
      if (!allowedRoles.includes(role)) return res.status(400).json({ msg: "Invalid role." });
      staff.role = role;
      updated = true;
    }
    if (status) {
      if (!allowedStatus.includes(status)) return res.status(400).json({ msg: "Invalid status." });
      staff.status = status;
      updated = true;
    }
    if (!updated) return res.status(400).json({ msg: "No valid fields to update." });

    await staff.save();
    return res.json({ msg: "Staff updated successfully.", staff });
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin updates a customer's status
exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const adminId = req.user.id;
    const { status } = req.body;

    if (customerId === adminId) {
      return res.status(400).json({ msg: "You cannot update your own status." });
    }

    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ msg: "Customer not found." });
    if (customer.role !== "customer") {
      return res.status(400).json({ msg: "Only customers can be updated via this endpoint." });
    }

    const allowedStatus = ["active", "suspended", "terminated"];
    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({ msg: "Invalid or missing status." });
    }

    customer.status = status;
    await customer.save();
    return res.json({ msg: "Customer updated successfully.", customer });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin deletes a staff (banker) account
exports.deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const adminId = req.user.id;

    if (staffId === adminId) {
      return res.status(400).json({ msg: "You cannot delete your own account." });
    }

    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ msg: "Staff not found." });
    if (staff.role !== "banker") {
      return res.status(400).json({ msg: "Only banker accounts can be deleted via this endpoint." });
    }

    await User.deleteOne({ _id: staffId });
    return res.json({ msg: "Staff (banker) deleted successfully." });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin deletes a customer account
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const adminId = req.user.id;

    if (customerId === adminId) {
      return res.status(400).json({ msg: "You cannot delete your own account." });
    }

    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ msg: "Customer not found." });
    if (customer.role !== "customer") {
      return res.status(400).json({ msg: "Only customer accounts can be deleted via this endpoint." });
    }

    await User.deleteOne({ _id: customerId });
    return res.json({ msg: "Customer deleted successfully." });
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
