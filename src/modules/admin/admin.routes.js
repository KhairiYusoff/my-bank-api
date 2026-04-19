const express = require("express");
const router = express.Router();

const {
  createStaff,
  updateStaff,
  updateCustomer,
  deleteStaff,
  deleteCustomer,
} = require("./admin.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../middleware/authMiddleware");
const { validateStaffRegistration } = require("./admin.validation");
const { activityLogger } = require("../../services/activityService");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-specific operations
 */

router.use(authMiddleware);

/**
 * @swagger
 * /admin/create-staff:
 *   post:
 *     summary: Create a new staff member (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [banker, admin]
 *     responses:
 *       201:
 *         description: Staff account created successfully.
 *       400:
 *         description: Validation error or email exists.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Server error.
 */
router.post("/create-staff", [
  authorizeRoles("admin"),
  validateStaffRegistration,
  activityLogger("CREATE_STAFF", "Admin creating new staff"),
  createStaff,
]);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   delete:
 *     summary: Delete a staff (banker) account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Staff not found.
 *       500:
 *         description: Server error.
 */
router.delete("/staff/:staffId", [
  authorizeRoles("admin"),
  activityLogger("DELETE_STAFF", "Admin deleted a staff (banker)"),
  deleteStaff,
]);

/**
 * @swagger
 * /admin/customer/{customerId}:
 *   delete:
 *     summary: Delete a customer account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Server error.
 */
router.delete("/customer/:customerId", [
  authorizeRoles("admin"),
  activityLogger("DELETE_CUSTOMER", "Admin deleted a customer"),
  deleteCustomer,
]);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   put:
 *     summary: Update staff role or status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [banker, admin]
 *               status:
 *                 type: string
 *                 enum: [active, suspended, terminated]
 *     responses:
 *       200:
 *         description: Staff updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Staff not found.
 *       500:
 *         description: Server error.
 */
router.put("/staff/:staffId", [
  authorizeRoles("admin"),
  activityLogger("UPDATE_STAFF", "Admin updated a staff (banker)"),
  updateStaff,
]);

/**
 * @swagger
 * /admin/customer/{customerId}:
 *   put:
 *     summary: Update customer status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, terminated]
 *     responses:
 *       200:
 *         description: Customer updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Server error.
 */
router.put("/customer/:customerId", [
  authorizeRoles("admin"),
  activityLogger("UPDATE_CUSTOMER", "Admin updated a customer status"),
  updateCustomer,
]);

module.exports = router;
