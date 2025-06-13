const User = require('../../models/User');

// Customer completes their profile after receiving the approval email
exports.completeProfile = async (req, res) => {
  // The user's ID is attached to the request by our custom middleware
  const userId = req.userId;

  const {
    password,
    address,
    dateOfBirth,
    identityNumber,
    job,
    age,
    nationality,
    accountType,
    employerName,
    employmentType,
    salary,
    purposeOfAccount,
    maritalStatus,
    educationLevel,
    residencyStatus,
    nextOfKin,
  } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.isProfileComplete) {
      return res.status(400).json({ msg: 'Profile has already been completed.' });
    }

    // Update user with all the new details
    user.password = password; // The pre-save hook will hash this
    user.address = address;
    user.dateOfBirth = dateOfBirth;
    user.identityNumber = identityNumber;
    user.job = job;
    user.age = age;
    user.nationality = nationality;
    user.accountType = accountType;
    user.employerName = employerName;
    user.employmentType = employmentType;
    user.salary = salary;
    user.purposeOfAccount = purposeOfAccount;
    user.maritalStatus = maritalStatus;
    user.educationLevel = educationLevel;
    user.residencyStatus = residencyStatus;
    user.nextOfKin = nextOfKin;

    // Mark profile as complete
    user.isProfileComplete = true;

    await user.save();

    // Optionally, send another email confirming profile completion
    // For now, we'll just send a success response.

    res.json({ msg: 'Your profile has been completed successfully. It is now pending final verification.' });

  } catch (err) {
    console.error('Error completing profile:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        msg: 'Invalid user data', 
        errors: validationErrors 
      });
    } else if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        msg: `This ${field} is already in use by another account.` 
      });
    }
    res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};
