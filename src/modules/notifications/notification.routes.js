const express = require("express");
const { proxyNotificationRequest } = require("./notification.controller");
const { authMiddleware } = require("../../shared/middleware/authMiddleware");
const router = express.Router();

router.use(authMiddleware);

// Proxy all requests to the notification microservice
router.get("/", proxyNotificationRequest);
router.patch("/:id", proxyNotificationRequest);
router.delete("/:id", proxyNotificationRequest);

module.exports = router;
