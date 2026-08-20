const express = require("express");
const router = express.Router();

const {
  createStaff,
  updateStaff,
  updateCustomer,
  deleteStaff,
  deleteCustomer,
  getCustomer,
  getStaff,
} = require("./admin.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const { USER_ROLES } = require("../../shared/constants/user");
const { validateStaffRegistration } = require("./admin.validation");
const { activityLogger } = require("../audit/audit.service");

router.use(authMiddleware);

router.post("/create-staff", [
  authorizeRoles(USER_ROLES.ADMIN),
  validateStaffRegistration,
  activityLogger("CREATE_STAFF", "Admin creating new staff"),
  createStaff,
]);
router.delete("/staff/:staffId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger("DELETE_STAFF", "Admin deleted a staff (banker)"),
  deleteStaff,
]);
router.delete("/customer/:customerId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger("DELETE_CUSTOMER", "Admin deleted a customer"),
  deleteCustomer,
]);
router.put("/staff/:staffId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger("UPDATE_STAFF", "Admin updated a staff (banker)"),
  updateStaff,
]);
router.put("/customer/:customerId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger("UPDATE_CUSTOMER", "Admin updated a customer status"),
  updateCustomer,
]);
router.get("/customer/:customerId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER, USER_ROLES.AUDITOR),
  activityLogger("VIEW_CUSTOMER_PROFILE", "Staff viewed customer profile"),
  getCustomer,
]);
router.get("/staff/:staffId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  activityLogger("VIEW_STAFF_PROFILE", "Admin viewed staff profile"),
  getStaff,
]);

module.exports = router;
