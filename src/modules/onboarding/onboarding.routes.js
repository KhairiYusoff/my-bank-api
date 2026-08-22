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
  activityLogger("CUSTOMER_APPLICATION", "New customer application submitted"),
  apply,
]);
router.put("/complete-profile", [
  verifyProfileCompletionToken,
  validateFullRegistration,
  activityLogger("PROFILE_COMPLETED", "Customer completed profile"),
  completeProfile,
]);

router.use(authMiddleware);

router.get("/pending", [
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.BANKER,
    USER_ROLES.AUDITOR,
  ),
  activityLogger("VIEW_APPLICATIONS", "Staff viewing pending applications"),
  getPendingApplications,
]);
router.post("/approve/:userId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  activityLogger("APPROVE_APPLICATION", "Staff approved initial application"),
  approveApplication,
]);
router.post("/verify/:userId", [
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  activityLogger("VERIFY_CUSTOMER", "Staff verified customer account"),
  verifyCustomer,
]);

module.exports = router;
