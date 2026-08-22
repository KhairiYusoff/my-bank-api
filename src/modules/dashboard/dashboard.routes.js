const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("./dashboard.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const { USER_ROLES } = require("../../shared/constants/user");
const { activityLogger } = require("../audit/audit.service");

router.get("/", [
  authMiddleware,
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.BANKER,
    USER_ROLES.AUDITOR,
  ),
  activityLogger("VIEW_DASHBOARD", "Staff viewed dashboard"),
  getDashboardSummary,
]);

module.exports = router;
