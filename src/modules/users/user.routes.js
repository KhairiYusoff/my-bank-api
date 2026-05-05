const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/authMiddleware");
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
} = require("./user.middleware");
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
router.get("/customers", authorizeRoles("banker", "admin"), getAllCustomers);
router.get("/staff", authorizeRoles("admin"), getAllStaff);

module.exports = router;
