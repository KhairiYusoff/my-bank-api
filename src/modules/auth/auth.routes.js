const express = require("express");
const {
  login,
  refreshToken,
  logout,
  checkToken,
} = require("./auth.controller");
const { authMiddleware } = require("../../middleware/authMiddleware");
const { validateLogin } = require("./auth.validation");
const { activityLogger } = require("../../services/activityService");
const { authRateLimit } = require("../../middleware/rateLimitMiddleware");
const router = express.Router();

router.post("/login", [
  authRateLimit,
  validateLogin,
  activityLogger("LOGIN", "User login attempt"),
  login
]);

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
