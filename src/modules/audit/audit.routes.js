const express = require("express");
const {
  getOwnActivity,
  getUserActivity,
  getAllActivities,
} = require("./audit.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getOwnActivity);
router.get("/user/:userId", authorizeRoles("admin", "banker"), getUserActivity);
router.get("/all", authorizeRoles("admin"), getAllActivities);

module.exports = router;
