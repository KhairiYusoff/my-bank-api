const express = require("express");
const router = express.Router();

const {
  createStaff,
  updateStaff,
  updateCustomer,
  deleteStaff,
  deleteCustomer,
} = require("./admin.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const { validateStaffRegistration } = require("./admin.validation");
const { activityLogger } = require("../audit/audit.service");

router.use(authMiddleware);

router.post("/create-staff", [
  authorizeRoles("admin"),
  validateStaffRegistration,
  activityLogger("CREATE_STAFF", "Admin creating new staff"),
  createStaff,
]);
router.delete("/staff/:staffId", [
  authorizeRoles("admin"),
  activityLogger("DELETE_STAFF", "Admin deleted a staff (banker)"),
  deleteStaff,
]);
router.delete("/customer/:customerId", [
  authorizeRoles("admin"),
  activityLogger("DELETE_CUSTOMER", "Admin deleted a customer"),
  deleteCustomer,
]);
router.put("/staff/:staffId", [
  authorizeRoles("admin"),
  activityLogger("UPDATE_STAFF", "Admin updated a staff (banker)"),
  updateStaff,
]);
router.put("/customer/:customerId", [
  authorizeRoles("admin"),
  activityLogger("UPDATE_CUSTOMER", "Admin updated a customer status"),
  updateCustomer,
]);

module.exports = router;
