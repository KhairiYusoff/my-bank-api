const User = require('../../models/User');
const { sendEmail } = require('../../utils/email');
const jwt = require('jsonwebtoken');

// Banker/Admin gives final verification after customer completes their profile
exports.verifyCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.isProfileComplete) {
      return res.status(400).json({ msg: 'Cannot verify. The user has not completed their profile yet.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: 'User is already verified.' });
    }

    // Set final verification status
    user.isVerified = true;
    user.applicationStatus = 'completed';

    await user.save();

    // Optionally send a "Welcome" email

    res.json({ msg: 'Customer has been successfully verified and their account is now active.' });

  } catch (err) {
    console.error('Error verifying customer:', err);
    res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};

// Banker/Admin approves an initial application
exports.approveApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'User application not found' });
    }

    if (user.applicationStatus !== 'pending') {
      return res.status(400).json({ msg: `Application is already ${user.applicationStatus}` });
    }

    // Update application status
    user.applicationStatus = 'approved';
    
    // Generate a secure token for the user to complete their profile
    // This token is short-lived and has a specific purpose
    const profileCompletionToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, // Using the main JWT secret, but could use a different one
      { expiresIn: '24h' } // Link expires in 24 hours
    );

    // In a real app, the frontend URL would come from a config file
    const completeProfileUrl = `http://localhost:3000/complete-profile?token=${profileCompletionToken}`;

    // Send an email to the user with the link to complete their profile
    await sendEmail({
      to: user.email,
      subject: 'Your Bank Application: Next Steps',
      text: `Hello ${user.name},\n\nYour application has been approved! Please complete your profile by clicking the link below:\n\n${completeProfileUrl}\n\nThis link will expire in 24 hours.\n\nThank you,\nMy Bank`,
      html: `<p>Hello ${user.name},</p><p>Your application has been approved! Please complete your profile by clicking the link below:</p><p><a href="${completeProfileUrl}">Complete Your Profile</a></p><p>This link will expire in 24 hours.</p><p>Thank you,<br/>My Bank</p>`,
    });

    await user.save();

    res.json({
      msg: 'Application approved. An email has been sent to the user to complete their profile.',
      userId: user._id,
    });

  } catch (err) {
    console.error('Error approving application:', err);
    res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};

