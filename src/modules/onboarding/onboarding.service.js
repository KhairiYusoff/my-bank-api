const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../shared/utils/email");
const User = require("../../shared/models/User");
const Account = require("../../shared/models/Account");
const { ACCOUNT_STATUS } = require("../../shared/constants/accountStatus");
const mongoose = require("mongoose");
const {
  notifyNewApplication,
} = require("../../shared/services/websocket.service");
const { generateAccountNumber } = require("../../shared/utils/generateAccountNumber");

// ─── Private helpers ──────────────────────────────────────────────────────────

const generateProfileCompletionToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

const decodeHtmlEntities = (str) =>
  str
    ? str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
    : str;

// ─── Service ──────────────────────────────────────────────────────────────────

class OnboardingService {
  buildProfileCompletionUrl(userId) {
    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5190";
    const token = generateProfileCompletionToken(userId);
    return { token, url: `${frontendUrl}/complete-profile?token=${token}` };
  }

  async sendApprovalEmail({ email, name, completeProfileUrl }) {
    await sendEmail({
      to: email,
      subject: "Your Bank Application: Next Steps",
      text: `Dear ${name},\n\nYour application has been approved. Complete your profile here:\n\n${completeProfileUrl}\n\nThis link expires in 24 hours.\n\nMy Bank Team`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e5e5;background:#fafbfc;">
      <h2 style="color:#0a3d62;">Congratulations, ${name}!</h2>
      <p>Your bank application has been <b>approved</b>.</p>
      <p style="margin:18px 0;">Complete your profile to activate your account:</p>
      <p><a href="${completeProfileUrl}" style="display:inline-block;padding:12px 24px;background:#0a3d62;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Complete Your Profile</a></p>
      <p><b>This link will expire in 24 hours.</b></p>
      <p style="margin-top:32px;">Thank you for choosing <b>My Bank</b>.<br/>My Bank Team</p>
    </div>`,
    });
  }

  async sendActivationEmail({ email, name }) {
    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5190";
    await sendEmail({
      to: email,
      subject: "Congratulations! Your Bank Account is Now Active",
      text: `Dear ${name},\n\nYour bank account is now active. Log in here: ${frontendUrl}/login\n\nMy Bank Team`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e5e5;background:#fafbfc;">
      <h2 style="color:#0a3d62;">Congratulations, ${name}!</h2>
      <p>Your bank account has been <b>successfully verified</b> and is now active.</p>
      <p style="margin:18px 0;"><a href="${frontendUrl}/login" style="display:inline-block;padding:12px 24px;background:#0a3d62;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Log In to My Bank</a></p>
      <p style="margin-top:32px;">Thank you for choosing <b>My Bank</b>.<br/>My Bank Team</p>
    </div>`,
    });
  }

  async applyForAccount({ name, email, phoneNumber }) {
    const existing = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing) {
      const msg =
        existing.email === email
          ? "An application with this email already exists"
          : "An application with this phone number already exists";
      const err = new Error(msg);
      err.statusCode = 400;
      throw err;
    }

    try {
      const user = new User({
        name,
        email,
        phoneNumber,
        role: "customer",
        isVerified: false,
        isProfileComplete: false,
        applicationStatus: "pending",
      });
      await user.save();
      notifyNewApplication(user);
      return { userId: user._id.toString() };
    } catch (mongoErr) {
      if (mongoErr.name === "ValidationError") {
        const err = new Error("Invalid user data");
        err.statusCode = 400;
        err.errors = Object.values(mongoErr.errors).map((e) => e.message);
        throw err;
      }
      if (mongoErr.code === 11000) {
        const err = new Error("Email already in use");
        err.statusCode = 400;
        throw err;
      }
      throw mongoErr;
    }
  }

  async approveApplication(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User application not found");
      err.statusCode = 404;
      throw err;
    }
    if (user.applicationStatus !== "pending") {
      const err = new Error(`Application is already ${user.applicationStatus}`);
      err.statusCode = 400;
      throw err;
    }

    user.applicationStatus = "approved";
    const { url: completeProfileUrl } = this.buildProfileCompletionUrl(
      user._id,
    );
    await this.sendApprovalEmail({
      email: user.email,
      name: user.name,
      completeProfileUrl,
    });

    await user.save();

    return { userId: user._id, completeProfileUrl };
  }

  async completeProfile(userId, profileData) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    if (user.isProfileComplete) {
      const err = new Error("Profile has already been completed.");
      err.statusCode = 400;
      throw err;
    }

    try {
      Object.assign(user, { ...profileData, isProfileComplete: true });
      await user.save();
    } catch (mongoErr) {
      if (mongoErr.name === "ValidationError") {
        const err = new Error("Invalid user data");
        err.statusCode = 400;
        err.errors = Object.values(mongoErr.errors).map((e) => e.message);
        throw err;
      }
      if (mongoErr.code === 11000) {
        const field = Object.keys(mongoErr.keyPattern)[0];
        const err = new Error(
          `This ${field} is already in use by another account.`,
        );
        err.statusCode = 400;
        throw err;
      }
      throw mongoErr;
    }
  }

  async verifyCustomer(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    if (!user.isProfileComplete) {
      const err = new Error(
        "Cannot verify. The user has not completed their profile yet.",
      );
      err.statusCode = 400;
      throw err;
    }
    if (user.isVerified) {
      const err = new Error("User is already verified.");
      err.statusCode = 400;
      throw err;
    }

    user.isVerified = true;
    user.applicationStatus = "completed";

    const ACCOUNT_TYPE_MAP = {
      savings: "savings",
      current: "current",
      business: "business",
      fixed_deposit: "fixed_deposit",
    };

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await user.save({ session });
      const accountType = ACCOUNT_TYPE_MAP[user.accountType] || "savings";
      const accountNumber = await generateAccountNumber(accountType, user.branch);
      
      const newAccount = new Account({
        user: user._id,
        accountNumber,
        accountType,
        branch: user.branch,
        balance: 0,
        currency: "MYR",
        status: ACCOUNT_STATUS.ACTIVE,
        dateOpened: new Date(),
      });
      await newAccount.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    await this.sendActivationEmail({ email: user.email, name: user.name });
  }

  async getPendingApplications(query) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      name,
      email,
      phoneNumber,
      identityNumber,
      dateFrom,
      dateTo,
      search,
    } = query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { isVerified: false, role: "customer" };
    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (phoneNumber) filter.phoneNumber = new RegExp(phoneNumber, "i");
    if (identityNumber) filter.identityNumber = new RegExp(identityNumber, "i");
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phoneNumber: new RegExp(search, "i") },
        { identityNumber: new RegExp(search, "i") },
      ];
    }

    let applications = await User.find(filter)
      .select(
        "name email phoneNumber identityNumber createdAt applicationStatus isProfileComplete",
      )
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean();

    applications = applications.map((app) => ({
      ...app,
      name: decodeHtmlEntities(app.name),
    }));

    const total = await User.countDocuments(filter);

    return {
      applications,
      meta: {
        page: numericPage,
        limit: numericLimit,
        pages: Math.ceil(total / numericLimit),
        total,
      },
    };
  }
}

module.exports = new OnboardingService();
