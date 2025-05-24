const express = require("express");
const { createStaff, registerCustomer, getPendingApplications } = require("../controllers/adminController");
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

// Register new customer (admin/banker only)
router.post(
  "/register-customer",
  authMiddleware,
  authorizeRoles("admin", "banker"),
  validateRegistration,
  registerCustomer
);

// Get pending customer applications
router.get(
  "/pending-applications",
  authMiddleware,
  authorizeRoles("admin", "banker"),
  getPendingApplications
);

module.exports = router;
