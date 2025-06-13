const express = require("express");
const {
  apply,
  login,
  refreshToken,
  logout,
  checkToken,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  validateInitialApplication,
} = require("../middleware/validationMiddleware");
const { activityLogger } = require("../services/activityService");
const router = express.Router();

/**
 * @swagger
 * /auth/apply:
 *   post:
 *     summary: Apply for a new bank account
 *     tags: [V1 - Authentication]
 *     description: Starts the customer onboarding process by submitting an initial application with basic user information. This is the first step in the v2 onboarding flow, but uses a v1 endpoint for initial contact.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sarah Tan"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "sarah.tan@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "60123456781"
 *     responses:
 *       200:
 *         description: Application submitted successfully. Returns the new user's ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Application submitted successfully. Please await approval."
 *                 userId:
 *                   type: string
 *                   example: "60c72b2f9b1d8c001f8e4d1e"
 *       400:
 *         description: Bad request, likely due to validation errors (e.g., email already exists, invalid data).
 *       500:
 *         description: Server error.
 */
router.post("/apply", [
  validateInitialApplication,
  activityLogger("CUSTOMER_APPLICATION", "New customer application"),
  apply,
]);

// Login
router.post("/login", [activityLogger("LOGIN", "User login attempt"), login]);

// Logout
router.post("/logout", [
  authMiddleware,
  activityLogger("LOGOUT", "User logout"),
  logout,
]);

// Token management (no activity logging needed)
router.post("/refresh-token", refreshToken);
router.get("/check-token", authMiddleware, checkToken);

module.exports = router;
