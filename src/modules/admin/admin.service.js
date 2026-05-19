const User = require("../../shared/models/User");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../../shared/utils/email");
const {
  sendNotification,
} = require("../../shared/services/notification.service");

class AdminService {
  async createStaff({ name, email, password, role }) {
    const validRoles = ["admin", "banker"];
    if (!validRoles.includes(role)) {
      const err = new Error("Invalid role assignment");
      err.statusCode = 400;
      throw err;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error("User with this email already exists");
      err.statusCode = 400;
      throw err;
    }

    const user = new User({
      name,
      email,
      password,
      role,
      isVerified: true,
      isProfileComplete: true,
    });

    await user.save();
    return { role };
  }

  async updateStaff(staffId, adminId, { role, status }) {
    if (staffId === adminId) {
      const err = new Error("You cannot update your own role or status.");
      err.statusCode = 400;
      throw err;
    }

    const staff = await User.findById(staffId);
    if (!staff) {
      const err = new Error("Staff not found.");
      err.statusCode = 404;
      throw err;
    }
    if (staff.role !== "banker" && staff.role !== "admin") {
      const err = new Error(
        "Only staff (banker/admin) can be updated via this endpoint.",
      );
      err.statusCode = 400;
      throw err;
    }

    const allowedRoles = ["banker", "admin"];
    const allowedStatus = ["active", "suspended", "terminated"];
    let updated = false;

    if (role) {
      if (!allowedRoles.includes(role)) {
        const err = new Error("Invalid role.");
        err.statusCode = 400;
        throw err;
      }
      staff.role = role;
      updated = true;
    }
    if (status) {
      if (!allowedStatus.includes(status)) {
        const err = new Error("Invalid status.");
        err.statusCode = 400;
        throw err;
      }
      staff.status = status;
      updated = true;
    }
    if (!updated) {
      const err = new Error("No valid fields to update.");
      err.statusCode = 400;
      throw err;
    }

    await staff.save();
    return staff;
  }

  async updateCustomer(customerId, adminId, { status }) {
    if (customerId === adminId) {
      const err = new Error("You cannot update your own status.");
      err.statusCode = 400;
      throw err;
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      const err = new Error("Customer not found.");
      err.statusCode = 404;
      throw err;
    }
    if (customer.role !== "customer") {
      const err = new Error(
        "Only customers can be updated via this endpoint.",
      );
      err.statusCode = 400;
      throw err;
    }

    const allowedStatus = ["active", "suspended", "terminated"];
    if (!status || !allowedStatus.includes(status)) {
      const err = new Error("Invalid or missing status.");
      err.statusCode = 400;
      throw err;
    }

    customer.status = status;
    await customer.save();
    return customer;
  }

  async deleteStaff(staffId, adminId) {
    if (staffId === adminId) {
      const err = new Error("You cannot delete your own account.");
      err.statusCode = 400;
      throw err;
    }

    const staff = await User.findById(staffId);
    if (!staff) {
      const err = new Error("Staff not found.");
      err.statusCode = 404;
      throw err;
    }
    if (staff.role !== "banker") {
      const err = new Error(
        "Only banker accounts can be deleted via this endpoint.",
      );
      err.statusCode = 400;
      throw err;
    }

    await User.deleteOne({ _id: staffId });
  }

  async deleteCustomer(customerId, adminId) {
    if (customerId === adminId) {
      const err = new Error("You cannot delete your own account.");
      err.statusCode = 400;
      throw err;
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      const err = new Error("Customer not found.");
      err.statusCode = 404;
      throw err;
    }
    if (customer.role !== "customer") {
      const err = new Error(
        "Only customer accounts can be deleted via this endpoint.",
      );
      err.statusCode = 400;
      throw err;
    }

    await User.deleteOne({ _id: customerId });
  }
}

module.exports = new AdminService();
