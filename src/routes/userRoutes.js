const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { checkActivityAccess } = require("../middleware/activityMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getUserActivity,
  updatePreferences,
  getAllCustomers,
} = require("../controllers/userController");
const {
  validateProfileUpdate,
  validatePasswordChange,
  validatePreferencesUpdate,
} = require("../middleware/userMiddleware");
const User = require("../models/User");

router.use(authMiddleware);

// Profile routes
router.get("/me", getProfile);
router.put("/me", validateProfileUpdate, updateProfile);
router.put("/me/password", validatePasswordChange, changePassword);
router.delete("/me", deleteAccount);

// Activity routes
router.get("/me/activity", getUserActivity);
router.get(
  "/activity/:userId",
  authorizeRoles("banker", "admin"),
  checkActivityAccess,
  getUserActivity
);

// Preferences route
router.put("/me/preferences", validatePreferencesUpdate, updatePreferences);

// Admin/Banker routes
router.get("/customers", authorizeRoles("banker", "admin"), getAllCustomers);

module.exports = router;
