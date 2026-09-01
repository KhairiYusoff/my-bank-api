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
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_DETAILS,
} = require("../../shared/constants/activities");
const { validateStaffRegistration } = require("./admin.validation");
const { activityLogger } = require("../audit/audit.service");

router.use(authMiddleware);

router.post("/create-staff", [
  authorizeRoles(USER_ROLES.ADMIN),
  validateStaffRegistration,
  activityLogger(ACTIVITY_ACTIONS.CREATE_STAFF, ACTIVITY_DETAILS.CREATE_STAFF),
  createStaff,
]);
router.delete("/staff/:staffId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger(ACTIVITY_ACTIONS.DELETE_STAFF, ACTIVITY_DETAILS.DELETE_STAFF),
  deleteStaff,
]);
router.delete("/customer/:customerId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger(ACTIVITY_ACTIONS.DELETE_CUSTOMER, ACTIVITY_DETAILS.DELETE_CUSTOMER),
  deleteCustomer,
]);
router.put("/staff/:staffId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger(ACTIVITY_ACTIONS.UPDATE_STAFF, ACTIVITY_DETAILS.UPDATE_STAFF),
  updateStaff,
]);
router.put("/customer/:customerId", [
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger(ACTIVITY_ACTIONS.UPDATE_CUSTOMER, ACTIVITY_DETAILS.UPDATE_CUSTOMER),
  updateCustomer,
]);
router.get("/customer/:customerId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER, USER_ROLES.AUDITOR),
  activityLogger(ACTIVITY_ACTIONS.VIEW_CUSTOMER_PROFILE, ACTIVITY_DETAILS.VIEW_CUSTOMER_PROFILE),
  getCustomer,
]);
router.get("/staff/:staffId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  activityLogger(ACTIVITY_ACTIONS.VIEW_STAFF_PROFILE, ACTIVITY_DETAILS.VIEW_STAFF_PROFILE),
  getStaff,
]);

module.exports = router;
