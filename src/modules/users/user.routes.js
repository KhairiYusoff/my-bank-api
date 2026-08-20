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
const { activityLogger } = require("../audit/audit.service");

router.post("/me/reset-password", resetPassword);

router.use(authMiddleware);

router.get("/me", getProfile);
router.put(
  "/me",
  validateProfileUpdate,
  activityLogger("PROFILE_UPDATED", "User updated their profile"),
  updateProfile,
);
router.delete("/me", deleteAccount);
router.put(
  "/me/password",
  validatePasswordChange,
  activityLogger("PASSWORD_CHANGED", "User changed their password"),
  changePassword,
);
router.put(
  "/me/preferences",
  validatePreferencesUpdate,
  activityLogger("PREFERENCES_UPDATED", "User updated preferences"),
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
