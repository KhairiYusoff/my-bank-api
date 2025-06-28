const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../../middleware/authMiddleware");
const {
  approveApplication,
  verifyCustomer,
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
 * /admin/approve-application/{userId}:
 *   post:
 *     summary: Approve a customer's initial application
 *     tags: [V2 - Admin]
 *     description: An admin or banker approves a pending application, which triggers an email to the customer with a link to complete their profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose application is being approved.
 *     responses:
 *       200:
 *         description: Application approved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Application approved. An email has been sent to the user to complete their profile."
 *                 userId:
 *                   type: string
 *       400:
 *         description: Bad request (e.g., application already processed).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       403:
 *         description: Forbidden (user is not an admin or banker).
 *       404:
 *         description: User application not found.
 *       500:
 *         description: Server error.
 */
router.post(
  "/approve-application/:userId",
  authorizeRoles("admin", "banker"),
  activityLogger("APPROVE_APPLICATION", "Staff approved initial application"),
  approveApplication
);

/**
 * @swagger
 * /admin/verify-customer/{userId}:
 *   post:
 *     summary: Perform final verification for a customer account
 *     tags: [V2 - Admin]
 *     description: An admin or banker gives the final approval for a customer who has completed their profile. This activates the account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to verify.
 *     responses:
 *       200:
 *         description: Customer verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Customer has been successfully verified and their account is now active."
 *       400:
 *         description: Bad request (e.g., user not ready for verification or already verified).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       403:
 *         description: Forbidden (user is not an admin or banker).
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post(
  "/verify-customer/:userId",
  authorizeRoles("admin", "banker"),
  activityLogger("VERIFY_CUSTOMER", "Staff verified customer account"),
  verifyCustomer
);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Staff (banker) deleted successfully."
 *       400:
 *         description: Bad request (cannot delete admin or self).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Staff not found.
 *       500:
 *         description: Server error.
 */
router.delete(
  "/staff/:staffId",
  authorizeRoles("admin"),
  activityLogger("DELETE_STAFF", "Admin deleted a staff (banker)"),
  deleteStaff
);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Customer deleted successfully."
 *       400:
 *         description: Bad request (cannot delete staff or admin).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Server error.
 */
router.delete(
  "/customer/:customerId",
  authorizeRoles("admin"),
  activityLogger("DELETE_CUSTOMER", "Admin deleted a customer"),
  deleteCustomer
);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   put:
 *     summary: Admin update staff role or status
 *     tags: [V2 - Admin]
 *     description: Admin can update a staff's role (banker/admin) or status (active/suspended/terminated). Cannot update other fields.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the staff (banker) to update.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Staff updated successfully."
 *                 staff:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (invalid fields or values).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Staff not found.
 *       500:
 *         description: Server error.
 */

router.put(
  "/staff/:staffId",
  authorizeRoles("admin"),
  activityLogger("UPDATE_STAFF", "Admin updated a staff (banker)"),
  updateStaff
);

/**
 * @swagger
 * /admin/customer/{customerId}:
 *   put:
 *     summary: Admin update customer status
 *     tags: [V2 - Admin]
 *     description: Admin can update a customer's status (active/suspended/terminated). Cannot update other fields.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer to update.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Customer updated successfully."
 *                 customer:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (invalid fields or values).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Server error.
 */
router.put(
  "/customer/:customerId",
  authorizeRoles("admin"),
  activityLogger("UPDATE_CUSTOMER", "Admin updated a customer status"),
  updateCustomer
);

module.exports = router;
