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
const { USER_ROLES } = require("../../shared/constants/user");

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getOwnActivity);
router.get(
  "/user/:userId",
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.BANKER,
    USER_ROLES.AUDITOR,
  ),
  getUserActivity,
);
router.get(
  "/all",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  getAllActivities,
);

module.exports = router;
