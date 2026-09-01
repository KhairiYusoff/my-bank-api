const express = require("express");
const {
  login,
  refreshToken,
  logout,
  checkToken,
} = require("./auth.controller");
const { authMiddleware } = require("../../shared/middleware/auth.middleware");
const { validateLogin } = require("./auth.validation");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_DETAILS,
} = require("../../shared/constants/activities");
const { activityLogger } = require("../audit/audit.service");
const {
  authRateLimit,
} = require("../../shared/middleware/rate-limit.middleware");
const router = express.Router();

router.post("/login", [
  authRateLimit,
  validateLogin,
  activityLogger(ACTIVITY_ACTIONS.LOGIN, ACTIVITY_DETAILS.LOGIN),
  login,
]);
router.post("/logout", [
  authMiddleware,
  activityLogger(ACTIVITY_ACTIONS.LOGOUT, ACTIVITY_DETAILS.LOGOUT),
  logout,
]);
router.post("/refresh-token", refreshToken);
router.get("/check-token", authMiddleware, checkToken);

module.exports = router;
