const express = require("express");
const router = express.Router();

const {
  apply,
  completeProfile,
  approveApplication,
  verifyCustomer,
  getPendingApplications,
} = require("./onboarding.controller");

const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/authMiddleware");
const { verifyProfileCompletionToken } = require("../../shared/middleware/tokenMiddleware");
const {
  validateInitialApplication,
  validateFullRegistration,
} = require("./onboarding.validation");
const { activityLogger } = require("../../shared/services/activityService");
const { authRateLimit } = require("../../shared/middleware/rateLimitMiddleware");

/**
 * @swagger
 * /onboarding/apply:
 *   post:
 *     summary: Submit a new customer application
 *     tags: [V2 - Onboarding]
 *     description: Public endpoint. Submit initial details to apply for a bank account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phoneNumber]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully.
 *       400:
 *         description: Validation error or duplicate application.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Server error.
 */
router.post("/apply", [
  authRateLimit,
  validateInitialApplication,
  activityLogger("CUSTOMER_APPLICATION", "New customer application submitted"),
  apply,
]);

/**
 * @swagger
 * /onboarding/complete-profile:
 *   put:
 *     summary: Complete customer profile after approval
 *     tags: [V2 - Onboarding]
 *     description: Called by the customer using the token from their approval email.
 *     security:
 *       - profileCompletionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile completed successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid or expired token.
 *       500:
 *         description: Server error.
 */
router.put("/complete-profile", [
  verifyProfileCompletionToken,
  validateFullRegistration,
  activityLogger("PROFILE_COMPLETED", "Customer completed profile"),
  completeProfile,
]);

// All routes below require staff authentication
router.use(authMiddleware);

/**
 * @swagger
 * /onboarding/pending:
 *   get:
 *     summary: Get all pending applications
 *     tags: [V2 - Onboarding]
 *     description: Returns a list of customers with pending application status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending applications.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Server error.
 */
router.get("/pending", [
  authorizeRoles("admin", "banker"),
  activityLogger("VIEW_APPLICATIONS", "Staff viewing pending applications"),
  getPendingApplications,
]);

/**
 * @swagger
 * /onboarding/approve/{userId}:
 *   post:
 *     summary: Approve a customer's initial application
 *     tags: [V2 - Onboarding]
 *     description: Sends the customer a profile completion email with a token link.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application approved and email sent.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post("/approve/:userId", [
  authorizeRoles("admin", "banker"),
  activityLogger("APPROVE_APPLICATION", "Staff approved initial application"),
  approveApplication,
]);

/**
 * @swagger
 * /onboarding/verify/{userId}:
 *   post:
 *     summary: Verify a customer and activate their account
 *     tags: [V2 - Onboarding]
 *     description: Final step — marks customer as verified, activates account, and creates bank account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer verified and account activated.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post("/verify/:userId", [
  authorizeRoles("admin", "banker"),
  activityLogger("VERIFY_CUSTOMER", "Staff verified customer account"),
  verifyCustomer,
]);

module.exports = router;
