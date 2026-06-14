const { validationResult } = require("express-validator");
const { success, error } = require("../../shared/utils/response");
const onboardingService = require("./onboarding.service");

exports.apply = async (req, res) => {
  const errorsResult = validationResult(req);
  if (!errorsResult.isEmpty()) {
    return error(res, {
      message: "Validation failed",
      errors: errorsResult.array(),
      statusCode: 400,
    });
  }

  const { name, email, phoneNumber } = req.body;
  try {
    const result = await onboardingService.applyForAccount({
      name,
      email,
      phoneNumber,
    });
    return success(res, {
      message:
        "Application submitted successfully. A bank representative will contact you.",
      data: result,
      statusCode: 201,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    return error(res, {
      message: err.message || "Server error. Please try again later.",
      statusCode: err.statusCode || 500,
      errors: err.errors,
    });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const result = await onboardingService.approveApplication(
      req.params.userId,
    );
    return success(res, {
      message:
        "Application approved. An email has been sent to the user to complete their profile.",
      data: result,
    });
  } catch (err) {
    console.error("Error approving application:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.completeProfile = async (req, res) => {
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
    branch,
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
    await onboardingService.completeProfile(userId, {
      password,
      address,
      dateOfBirth,
      identityNumber,
      job,
      age,
      nationality,
      accountType,
      branch,
      employerName,
      employmentType,
      salary,
      purposeOfAccount,
      maritalStatus,
      educationLevel,
      residencyStatus,
      nextOfKin,
    });
    return success(res, {
      message:
        "Your profile has been completed successfully. It is now pending final verification.",
    });
  } catch (err) {
    console.error("Error completing profile:", err.message);
    return error(res, {
      message: err.message || "Server error. Please try again later.",
      statusCode: err.statusCode || 500,
      errors: err.errors,
    });
  }
};

exports.verifyCustomer = async (req, res) => {
  try {
    await onboardingService.verifyCustomer(req.params.userId);
    return success(res, {
      message:
        "Customer has been successfully verified and their account is now active.",
    });
  } catch (err) {
    console.error("Error verifying customer:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getPendingApplications = async (req, res) => {
  try {
    const { applications, meta } =
      await onboardingService.getPendingApplications(req.query);
    return success(res, { data: applications, meta });
  } catch (err) {
    console.error("Error fetching pending applications:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};
