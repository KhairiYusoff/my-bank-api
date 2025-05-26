const express = require("express");
const { verifyUser } = require("../controllers/verificationController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/verify", authorizeRoles("banker", "admin"), verifyUser);

module.exports = router;
