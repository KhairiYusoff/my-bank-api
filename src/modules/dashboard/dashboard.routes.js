const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("./dashboard.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const { activityLogger } = require("../audit/audit.service");

router.get("/", [
  authMiddleware,
  authorizeRoles("admin", "banker", "auditor"),
  activityLogger("VIEW_DASHBOARD", "Staff viewed dashboard"),
  getDashboardSummary,
]);

module.exports = router;
