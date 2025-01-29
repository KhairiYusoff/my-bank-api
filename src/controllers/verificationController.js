const User = require("../models/User");

//Bankers/Admins Verify Customers Before They Can Login
exports.verifyUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Only allow verification for users who are not already verified
    if (user.isVerified) {
      return res.status(400).json({ msg: "User is already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ msg: "User verified successfully. They can now log in." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};
