const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { checkActivityAccess } = require("../middleware/activityMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getOwnActivity,
  getUserActivity,
  updatePreferences,
  getAllCustomers,
  getAllStaff,
  resetPassword,
} = require("../controllers/userController");
const {
  validateProfileUpdate,
  validatePasswordChange,
  validatePreferencesUpdate,
} = require("../middleware/userMiddleware");
const User = require("../models/User");
const { activityLogger } = require("../services/activityService");

/**
 * @swagger
 * tags:
 *   name: V1 - Users
 *   description: User profile and management operations (V1)
 */

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset password for any user (public, no login required)
 *     tags: [V1 - Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password to set
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Missing or invalid input.
 *       404:
 *         description: User not found.
 */
router.post("/me/reset-password", resetPassword);

router.use(authMiddleware);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the profile of the currently logged-in user
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's profile information.
 *   put:
 *     summary: Update the profile of the currently logged-in user
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *   delete:
 *     summary: Delete the account of the currently logged-in user
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 */
router.get("/me", getProfile);

router.put(
  "/me",
  validateProfileUpdate,
  activityLogger("PROFILE_UPDATED", "User updated their profile"),
  updateProfile
);
router.delete("/me", deleteAccount);

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     summary: Change the password for the currently logged-in user
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       400:
 *         description: Bad request (e.g., incorrect current password).
 */
router.put(
  "/me/password",
  validatePasswordChange,
  activityLogger("PASSWORD_CHANGED", "User changed their password"),
  changePassword
);

/**
 * @swagger
 * /users/me/activity:
 *   get:
 *     summary: Get the activity log for the currently logged-in user
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user activities.
 */
router.get("/me/activity", getOwnActivity);

/**
 * @swagger
 * /users/activity/{userId}:
 *   get:
 *     summary: Get the activity log for a specific user (banker/admin only)
 *     tags: [V1 - Users]
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
 *         description: A list of user activities.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 */
router.get(
  "/activity/:userId",
  authorizeRoles("banker", "admin"),
  checkActivityAccess,
  getUserActivity
);

/**
 * @swagger
 * /users/me/preferences:
 *   put:
 *     summary: Update the preferences for the currently logged-in user
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *               language:
 *                 type: string
 *                 example: "en-US"
 *     responses:
 *       200:
 *         description: Preferences updated successfully.
 */
router.put(
  "/me/preferences",
  validatePreferencesUpdate,
  activityLogger("PREFERENCES_UPDATED", "User updated preferences"),
  updatePreferences
);

/**
 * @swagger
 * /users/customers:
 *   get:
 *     summary: Get a list of all customers (banker/admin only)
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all customer users.
 *       403:
 *         description: Forbidden.
 */
router.get("/customers", authorizeRoles("banker", "admin"), getAllCustomers);

/**
 * @swagger
 * /users/staff:
 *   get:
 *     summary: Get a list of all staff (admin only)
 *     tags: [V1 - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all staff users.
 *       403:
 *         description: Forbidden.
 */
router.get("/staff", authorizeRoles("admin"), getAllStaff);

module.exports = router;
