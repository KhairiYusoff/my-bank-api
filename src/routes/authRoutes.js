const express = require("express");
const {
  apply,
  login,
  refreshToken,
  logout,
  checkToken,
} = require("../controllers/authController");
const {
  authMiddleware,
  validateRegistration,
} = require("../middleware/authMiddleware");
const { activityLogger } = require("../services/activityService");
const router = express.Router();

// Public application for new account
router.post("/apply", [
  validateRegistration,
  activityLogger("CUSTOMER_APPLICATION", "New customer application"),
  apply
]);

// Login
router.post("/login", [activityLogger("LOGIN", "User login attempt"), login]);

// Logout
router.post("/logout", [
  authMiddleware,
  activityLogger("LOGOUT", "User logout"),
  logout,
]);

// Token management (no activity logging needed)
router.post("/refresh-token", refreshToken);
router.get("/check-token", authMiddleware, checkToken);

module.exports = router;
