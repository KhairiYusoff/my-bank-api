const express = require('express');
const router = express.Router();

const { authMiddleware, authorizeRoles } = require('../../middleware/authMiddleware');
const { approveApplication, verifyCustomer } = require('../../controllers/v2/adminControllerV2');
const { activityLogger } = require('../../services/activityService');

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
  '/approve-application/:userId',
  authorizeRoles('admin', 'banker'),
  activityLogger('APPROVE_APPLICATION', 'Staff approved initial application'),
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
  '/verify-customer/:userId',
  authorizeRoles('admin', 'banker'),
  activityLogger('VERIFY_CUSTOMER', 'Staff verified customer account'),
  verifyCustomer
);

module.exports = router;
