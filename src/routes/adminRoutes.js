const express = require("express");
const { createStaff } = require("../controllers/adminController");
const {
  authMiddleware,
  authorizeRoles,
  validateRegistration,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-staff",
  authMiddleware,
  authorizeRoles("admin"),
  validateRegistration,
  createStaff
);

module.exports = router;
