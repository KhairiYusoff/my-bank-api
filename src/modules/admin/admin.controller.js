const { success, error } = require("../../shared/utils/response");
const adminService = require("./admin.service");

exports.createStaff = async (req, res) => {
  try {
    const { role } = await adminService.createStaff(req.body);
    return success(res, {
      message: `${role} created successfully.`,
      statusCode: 201,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await adminService.updateStaff(
      req.params.staffId,
      req.user.id,
      req.body,
    );
    return success(res, {
      message: "Staff updated successfully.",
      data: staff,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await adminService.updateCustomer(
      req.params.customerId,
      req.user.id,
      req.body,
    );
    return success(res, {
      message: "Customer updated successfully.",
      data: customer,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await adminService.deleteStaff(req.params.staffId, req.user.id);
    return success(res, { message: "Staff (banker) deleted successfully." });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await adminService.deleteCustomer(req.params.customerId, req.user.id);
    return success(res, { message: "Customer deleted successfully." });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await adminService.getCustomerById(req.params.customerId);
    return success(res, {
      message: "Customer fetched.",
      data: customer,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await adminService.getStaffById(req.params.staffId);
    return success(res, {
      message: "Staff fetched.",
      data: staff,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};
