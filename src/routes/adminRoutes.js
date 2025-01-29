const express = require("express");
const { createStaff } = require("../controllers/adminController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-staff",
  authMiddleware,
  authorizeRoles("admin"),
  createStaff
);

module.exports = router;
