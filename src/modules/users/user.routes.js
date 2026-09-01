const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  updatePreferences,
  getAllCustomers,
  getAllStaff,
  resetPassword,
} = require("./user.controller");
const {
  validateProfileUpdate,
  validatePasswordChange,
  validatePreferencesUpdate,
} = require("../../shared/middleware/user.middleware");
const { USER_ROLES } = require("../../shared/constants/user");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_DETAILS,
} = require("../../shared/constants/activities");
const { activityLogger } = require("../audit/audit.service");

router.post("/me/reset-password", resetPassword);

router.use(authMiddleware);

router.get("/me", getProfile);
router.put(
  "/me",
  validateProfileUpdate,
  activityLogger(ACTIVITY_ACTIONS.PROFILE_UPDATED, ACTIVITY_DETAILS.PROFILE_UPDATED),
  updateProfile,
);
router.delete("/me", deleteAccount);
router.put(
  "/me/password",
  validatePasswordChange,
  activityLogger(ACTIVITY_ACTIONS.PASSWORD_CHANGED, ACTIVITY_DETAILS.PASSWORD_CHANGED),
  changePassword,
);
router.put(
  "/me/preferences",
  validatePreferencesUpdate,
  activityLogger(ACTIVITY_ACTIONS.PREFERENCES_UPDATED, ACTIVITY_DETAILS.PREFERENCES_UPDATED),
  updatePreferences,
);
router.get(
  "/customers",
  authorizeRoles(USER_ROLES.BANKER, USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  getAllCustomers,
);
router.get(
  "/staff",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  getAllStaff,
);

module.exports = router;
