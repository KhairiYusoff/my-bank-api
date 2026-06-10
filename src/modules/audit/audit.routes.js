const express = require("express");
const {
  getOwnActivity,
  getUserActivity,
  getAllActivities,
} = require("./audit.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getOwnActivity);
router.get(
  "/user/:userId",
  authorizeRoles("admin", "banker", "auditor"),
  getUserActivity,
);
router.get("/all", authorizeRoles("admin", "auditor"), getAllActivities);

module.exports = router;
