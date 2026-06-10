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
  authorizeRoles("admin", "banker", "auditor"),
  activityLogger("VIEW_APPLICATIONS", "Staff viewing pending applications"),
  getPendingApplications,
]);
router.post("/approve/:userId", [
  authorizeRoles("admin", "banker"),
  activityLogger("APPROVE_APPLICATION", "Staff approved initial application"),
  approveApplication,
]);
router.post("/verify/:userId", [
  authorizeRoles("admin", "banker"),
  activityLogger("VERIFY_CUSTOMER", "Staff verified customer account"),
  verifyCustomer,
]);

module.exports = router;
