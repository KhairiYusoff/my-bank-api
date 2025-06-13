const express = require('express');
const router = express.Router();

const { completeProfile } = require('../../controllers/v2/userControllerV2');
const { verifyProfileCompletionToken } = require('../../middleware/tokenMiddleware');
const { validateFullRegistration } = require('../../middleware/validationMiddleware');

/**
 * @swagger
 * /users/complete-profile:
 *   put:
 *     summary: Complete user profile
 *     tags: [V2 - Users]
 *     description: Allows a customer to submit their full profile information after their initial application has been approved. This endpoint is protected by a special, single-use JWT sent to the user's email.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - idType
 *               - idNumber
 *               - address
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *               - dateOfBirth
 *               - employmentStatus
 *               - sourceOfFunds
 *             properties:
 *               password: { type: string, format: password, example: 'newSecurePassword123' }
 *               idType: { type: string, enum: ['passport', 'national_id', 'drivers_license'], example: 'national_id' }
 *               idNumber: { type: string, example: '901231-10-5678' }
 *               address: { type: string, example: '123 Jalan Ampang' }
 *               city: { type: string, example: 'Kuala Lumpur' }
 *               state: { type: string, example: 'Kuala Lumpur' }
 *               postalCode: { type: string, example: '50450' }
 *               country: { type: string, example: 'Malaysia' }
 *               dateOfBirth: { type: string, format: date, example: '1990-12-31' }
 *               employmentStatus: { type: string, enum: ['employed', 'unemployed', 'self_employed', 'student'], example: 'employed' }
 *               sourceOfFunds: { type: string, enum: ['salary', 'business', 'investment', 'inheritance', 'other'], example: 'salary' }
 *     responses:
 *       200:
 *         description: Profile completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Your profile has been completed successfully. It is now pending final verification."
 *       400:
 *         description: Bad request (e.g., validation errors, missing fields).
 *       401:
 *         description: Unauthorized (invalid, expired, or missing profile completion token).
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
// Route for a user to complete their profile after receiving an email link
// The token from the email is required for authorization
router.put(
  '/complete-profile',
  verifyProfileCompletionToken, // Verifies the special JWT from the email
  validateFullRegistration,   // Validates the comprehensive profile data
  completeProfile
);

module.exports = router;
