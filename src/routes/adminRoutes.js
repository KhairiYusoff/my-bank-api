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

/**
 * @swagger
 * tags:
 *   name: V1 - Admin
 *   description: Admin-specific operations (V1)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /admin/create-staff:
 *   post:
 *     summary: Create a new staff member (admin only)
 *     tags: [V1 - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@mybank.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "strongPassword123"
 *               role:
 *                 type: string
 *                 enum: [banker, admin]
 *                 example: "banker"
 *     responses:
 *       201:
 *         description: Staff account created successfully.
 *       400:
 *         description: Bad request (e.g., validation error, email exists).
 *       403:
 *         description: Forbidden (user is not an admin).
 *       500:
 *         description: Server error.
 */
router.post(
  "/create-staff",
  authorizeRoles("admin"),
  validateStaffRegistration,
  activityLogger("CREATE_STAFF", "Admin creating new staff"),
  createStaff
);

/**
 * @swagger
 * /admin/pending-applications:
 *   get:
 *     summary: Get a list of pending customer applications
 *     tags: [V1 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of pending applications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   applicationStatus:
 *                     type: string
 *                     example: "pending"
 *       403:
 *         description: Forbidden (user is not an admin or banker).
 *       500:
 *         description: Server error.
 */
router.get(
  "/pending-applications",
  authorizeRoles("admin", "banker"),
  activityLogger("VIEW_APPLICATIONS", "Staff viewing pending applications"),
  getPendingApplications
);

module.exports = router;
