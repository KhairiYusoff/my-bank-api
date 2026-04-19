const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/authMiddleware");
const {
  checkActivityAccess,
} = require("../../shared/middleware/activityMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getOwnActivity,
  getUserActivity,
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
const User = require("../../shared/models/User");
const { activityLogger } = require("../../shared/services/activityService");

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
router.get("/me/activity", getOwnActivity);
router.put(
  "/me/preferences",
  validatePreferencesUpdate,
  activityLogger("PREFERENCES_UPDATED", "User updated preferences"),
  updatePreferences,
);
router.get(
  "/activity/:userId",
  authorizeRoles("banker", "admin"),
  checkActivityAccess,
  getUserActivity,
);
router.get("/customers", authorizeRoles("banker", "admin"), getAllCustomers);
router.get("/staff", authorizeRoles("admin"), getAllStaff);

module.exports = router;
