const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
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

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, validateProfileUpdate, updateProfile);
router.put(
  "/me/password",
  authMiddleware,
  validatePasswordChange,
  changePassword
);
router.delete("/me", authMiddleware, deleteAccount);
router.get("/me/activity", authMiddleware, getUserActivity);
router.put(
  "/me/preferences",
  authMiddleware,
  validatePreferencesUpdate,
  updatePreferences
);
router.get(
  "/customers",
  authMiddleware,
  authorizeRoles("banker", "admin"),
  getAllCustomers
);

module.exports = router;
