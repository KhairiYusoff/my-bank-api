const { success } = require("../../shared/utils/response");
const adminService = require("./admin.service");

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ success: false, message: err.message || "Internal server error" });
};

exports.createStaff = async (req, res) => {
  try {
    const { role } = await adminService.createStaff(req.body);
    return success(res, { message: `${role} created successfully.`, statusCode: 201 });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await adminService.updateStaff(
      req.params.staffId,
      req.user.id,
      req.body,
    );
    return res.json({ msg: "Staff updated successfully.", staff });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await adminService.updateCustomer(
      req.params.customerId,
      req.user.id,
      req.body,
    );
    return res.json({ msg: "Customer updated successfully.", customer });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await adminService.deleteStaff(req.params.staffId, req.user.id);
    return res.json({ msg: "Staff (banker) deleted successfully." });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await adminService.deleteCustomer(req.params.customerId, req.user.id);
    return res.json({ msg: "Customer deleted successfully." });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};
