const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../../middleware/authMiddleware");
const {
  deleteStaff,
  deleteCustomer,
  updateStaff,
  updateCustomer,
} = require("../../controllers/v2/adminControllerV2");
const { activityLogger } = require("../../services/activityService");

// All routes in this file are protected and require staff access
router.use(authMiddleware);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   delete:
 *     summary: Delete a staff (banker) account
 *     tags: [V2 - Admin]
 *     description: Admin can delete a banker/staff account. Cannot delete another admin or self.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the staff (banker) to delete.
 *     responses:
 *       200:
 *         description: Staff deleted successfully.
 *       400:
 *         description: Bad request (cannot delete admin or self).
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
 *     tags: [V2 - Admin]
 *     description: Admin can delete a customer account. Cannot delete staff or admin via this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer to delete.
 *     responses:
 *       200:
 *         description: Customer deleted successfully.
 *       400:
 *         description: Bad request (cannot delete staff or admin).
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
 *     summary: Admin update staff role or status
 *     tags: [V2 - Admin]
 *     description: Admin can update a staff's role (banker/admin) or status (active/suspended/terminated).
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
 *     summary: Admin update customer status
 *     tags: [V2 - Admin]
 *     description: Admin can update a customer's status (active/suspended/terminated).
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
