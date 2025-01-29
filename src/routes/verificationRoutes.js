const express = require("express");
const { verifyUser } = require("../controllers/verificationController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/verify",
  authMiddleware,
  authorizeRoles("banker", "admin"),
  verifyUser
);

module.exports = router;
