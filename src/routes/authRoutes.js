const express = require("express");
const {
  registerCustomer,
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

// Register new customer
router.post("/register-customer", [
  authMiddleware,
  validateRegistration,
  activityLogger("CUSTOMER_REGISTRATION", "New customer registration"),
  registerCustomer,
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
