const express = require("express");
const router = express.Router();

const {
  apply,
  completeProfile,
  approveApplication,
  verifyCustomer,
  getPendingApplications,
} = require("./onboarding.controller");

const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const { USER_ROLES } = require("../../shared/constants/user");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_DETAILS,
} = require("../../shared/constants/activities");
const {
  verifyProfileCompletionToken,
} = require("../../shared/middleware/token.middleware");
const {
  validateInitialApplication,
  validateFullRegistration,
} = require("./onboarding.validation");
const { activityLogger } = require("../audit/audit.service");
const {
  authRateLimit,
} = require("../../shared/middleware/rate-limit.middleware");

router.post("/apply", [
  authRateLimit,
  validateInitialApplication,
  activityLogger(ACTIVITY_ACTIONS.CUSTOMER_APPLICATION, ACTIVITY_DETAILS.CUSTOMER_APPLICATION),
  apply,
]);
router.put("/complete-profile", [
  verifyProfileCompletionToken,
  validateFullRegistration,
  activityLogger(ACTIVITY_ACTIONS.PROFILE_COMPLETED, ACTIVITY_DETAILS.PROFILE_COMPLETED),
  completeProfile,
]);

router.use(authMiddleware);

router.get("/pending", [
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.BANKER,
    USER_ROLES.AUDITOR,
  ),
  activityLogger(ACTIVITY_ACTIONS.VIEW_APPLICATIONS, ACTIVITY_DETAILS.VIEW_APPLICATIONS),
  getPendingApplications,
]);
router.post("/approve/:userId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.APPROVE_APPLICATION, ACTIVITY_DETAILS.APPROVE_APPLICATION),
  approveApplication,
]);
router.post("/verify/:userId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.VERIFY_CUSTOMER, ACTIVITY_DETAILS.VERIFY_CUSTOMER),
  verifyCustomer,
]);

module.exports = router;
