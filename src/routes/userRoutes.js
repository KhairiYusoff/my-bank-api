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

// Profile routes
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, validateProfileUpdate, updateProfile);
router.put(
  "/me/password",
  authMiddleware,
  validatePasswordChange,
  changePassword
);
router.delete("/me", authMiddleware, deleteAccount);

// Activity routes
router.get("/me/activity", authMiddleware, getUserActivity);
router.get(
  "/activity/:userId",
  authMiddleware,
  authorizeRoles("banker", "admin"),
  checkActivityAccess,
  getUserActivity
);

// Preferences route
router.put(
  "/me/preferences",
  authMiddleware,
  validatePreferencesUpdate,
  updatePreferences
);

// Admin/Banker routes
router.get(
  "/customers",
  authMiddleware,
  authorizeRoles("banker", "admin"),
  getAllCustomers
);

module.exports = router;
