const express = require("express");
const {
  login,
  refreshToken,
  logout,
  checkToken,
} = require("./auth.controller");
const { authMiddleware } = require("../../shared/middleware/authMiddleware");
const { validateLogin } = require("./auth.validation");
const { activityLogger } = require("../../shared/services/activityService");
const { authRateLimit } = require("../../shared/middleware/rateLimitMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and token management
 *
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful. Access and refresh tokens set as HttpOnly cookies.
 *       400:
 *         description: Invalid credentials.
 *       403:
 *         description: Account not verified.
 *       429:
 *         description: Too many login attempts.
 *
 * /auth/logout:
 *   post:
 *     summary: Logout and clear session cookies
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful.
 *       401:
 *         description: Unauthorized.
 *
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued.
 *       401:
 *         description: Refresh token invalid or expired.
 *
 * /auth/check-token:
 *   get:
 *     summary: Validate current access token and return user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid.
 *       401:
 *         description: Token invalid or expired.
 */

router.post("/login", [
  authRateLimit,
  validateLogin,
  activityLogger("LOGIN", "User login attempt"),
  login
]);

router.post("/logout", [
  authMiddleware,
  activityLogger("LOGOUT", "User logout"),
  logout,
]);

router.post("/refresh-token", refreshToken);
router.get("/check-token", authMiddleware, checkToken);

module.exports = router;
