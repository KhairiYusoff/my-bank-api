const User = require("../models/User");

//Bankers/Admins Verify Customers Before They Can Login
exports.verifyUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ msg: "User verified successfully. They can now log in." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};
