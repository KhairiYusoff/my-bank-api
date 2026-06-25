const { success, error } = require("../../shared/utils/response");
const { checkAmount } = require("../../shared/utils/validation.helpers");
const accountService = require("./account.service");

exports.createAccount = async (req, res) => {
  try {
    const {
      userId,
      accountType,
      branch,
      balance,
      interestRate,
      overdraftLimit,
      minimumBalance,
    } = req.body;
    const account = await accountService.createAccount(userId, {
      accountType,
      branch,
      balance,
      interestRate,
      overdraftLimit,
      minimumBalance,
    });
    return success(res, {
      message: "Account created",
      data: account,
      statusCode: 201,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const result = await accountService.getAccounts(req.user.id, req.query);
    return success(res, {
      message: "Accounts fetched",
      data: result.accounts,
      meta: result.meta,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const result = await accountService.getAllAccounts(req.query);
    return success(res, {
      message: "Accounts fetched",
      data: result.accounts,
      meta: result.meta,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const data = await accountService.getBalance(
      req.params.accountNumber,
      req.user.id,
      req.user.role,
    );
    return success(res, { message: "Balance fetched", data });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await accountService.deleteAccount(req.params.accountNumber);
    return success(res, { message: "Account closed successfully." });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.deposit = async (req, res) => {
  const { accountNumber, amount, memo } = req.body;
  const amountError = checkAmount(res, amount, "deposit");
  if (amountError) return amountError;

  try {
    const result = await accountService.deposit(
      accountNumber,
      amount,
      req.user.id,
      req.user.role,
      memo,
      req.ip,
      req.headers["user-agent"],
    );
    return success(res, { message: "Deposit successful", data: result });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.withdraw = async (req, res) => {
  const { accountNumber, amount, memo } = req.body;
  const amountError = checkAmount(res, amount, "withdraw");
  if (amountError) return amountError;

  try {
    const result = await accountService.withdraw(
      accountNumber,
      amount,
      req.user.id,
      req.user.role,
      memo,
      req.ip,
      req.headers["user-agent"],
    );
    return success(res, { message: "Withdrawal successful", data: result });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.airdrop = async (req, res) => {
  const { accountNumber, amount, memo } = req.body;
  const amountError = checkAmount(res, amount, "airdrop");
  if (amountError) return amountError;

  try {
    const result = await accountService.airdrop(
      accountNumber,
      amount,
      memo,
      req.user.id,
      req.user.role,
      req.ip,
      req.headers["user-agent"],
    );
    return success(res, { message: "Airdrop successful", data: result });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getAccountByNumber = async (req, res) => {
  try {
    const account = await accountService.getAccountByNumber(
      req.params.accountNumber,
    );
    return success(res, { message: "Account fetched.", data: account });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.updateAccountStatus = async (req, res) => {
  try {
    const account = await accountService.updateAccountStatus(
      req.params.accountNumber,
      req.body.status,
    );
    return success(res, {
      message: "Account status updated.",
      data: account,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.setOverdraftLimit = async (req, res) => {
  try {
    const result = await accountService.setOverdraftLimit(
      req.params.accountNumber,
      req.body.overdraftLimit,
    );
    return success(res, { message: "Overdraft limit updated", data: result });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.fdSettle = async (req, res) => {
  try {
    const result = await accountService.fdSettle(
      req.params.accountNumber,
      req.user.id,
    );
    return success(res, {
      message: "Fixed Deposit principal has been settled successfully",
      data: result,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.updateFdInstructions = async (req, res) => {
  try {
    const result = await accountService.updateFdInstructions(
      req.params.accountNumber,
      req.user.id,
      req.body,
    );
    return success(res, {
      message: "Fixed Deposit instructions updated successfully",
      data: result,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.fdWithdrawEarly = async (req, res) => {
  try {
    const result = await accountService.fdWithdrawEarly(
      req.params.accountNumber,
      req.user.id,
    );
    return success(res, {
      message: "Fixed Deposit early withdrawal processed successfully",
      data: result,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getAccountLimits = async (req, res) => {
  try {
    const data = accountService.getAccountLimits();
    return success(res, { message: "Account limits fetched", data });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.requestAccount = async (req, res) => {
  try {
    const account = await accountService.requestAccount(req.user.id, req.body);
    return success(res, {
      message: "Account request submitted successfully",
      data: account,
      statusCode: 201,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getPendingAccountRequests = async (req, res) => {
  try {
    const result = await accountService.getPendingAccountRequests(req.query);
    return success(res, {
      message: "Pending account requests fetched",
      data: result.accounts,
      meta: result.meta,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.approveAccountRequest = async (req, res) => {
  try {
    const account = await accountService.approveAccountRequest(
      req.params.accountId,
      req.user.id,
    );
    return success(res, {
      message: "Account request approved",
      data: account,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.rejectAccountRequest = async (req, res) => {
  try {
    const account = await accountService.rejectAccountRequest(
      req.params.accountId,
      req.user.id,
      req.body.reason,
    );
    return success(res, {
      message: "Account request rejected",
      data: account,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.suspendAccount = async (req, res) => {
  try {
    const account = await accountService.suspendAccount(
      req.params.accountNumber,
    );
    return success(res, {
      message: "Account suspended successfully.",
      data: account,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.reactivateAccount = async (req, res) => {
  try {
    const account = await accountService.reactivateAccount(
      req.params.accountNumber,
    );
    return success(res, {
      message: "Account reactivated successfully.",
      data: account,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};
