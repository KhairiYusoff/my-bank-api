const express = require("express");
const {
  login,
  refreshToken,
  logout,
  checkToken,
} = require("./auth.controller");
const { authMiddleware } = require("../../shared/middleware/auth.middleware");
const { validateLogin } = require("./auth.validation");
const { activityLogger } = require("../audit/audit.service");
const {
  authRateLimit,
} = require("../../shared/middleware/rate-limit.middleware");
const router = express.Router();

router.post("/login", [
  authRateLimit,
  validateLogin,
  activityLogger("LOGIN", "User login attempt"),
  login,
]);
router.post("/logout", [
  authMiddleware,
  activityLogger("LOGOUT", "User logout"),
  logout,
]);
router.post("/refresh-token", refreshToken);
router.get("/check-token", authMiddleware, checkToken);

module.exports = router;
