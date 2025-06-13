const express = require("express");
const {
  createStaff,
  getPendingApplications,
} = require("../controllers/adminController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  validateStaffRegistration,
} = require("../middleware/validationMiddleware");
const { activityLogger } = require("../services/activityService");

const router = express.Router();

router.use(authMiddleware);

// Create staff (admin only)
router.post(
  "/create-staff",
  authorizeRoles("admin"),
  validateStaffRegistration,
  activityLogger("CREATE_STAFF", "Admin creating new staff"),
  createStaff
);


// Get pending customer applications (admin/banker only)
router.get(
  "/pending-applications",
  authorizeRoles("admin", "banker"),
  activityLogger("VIEW_APPLICATIONS", "Staff viewing pending applications"),
  getPendingApplications
);

module.exports = router;
