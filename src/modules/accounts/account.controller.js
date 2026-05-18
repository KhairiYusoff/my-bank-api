const { success } = require("../../shared/utils/response");
const { checkAmount } = require("../../shared/utils/validation.helpers");
const accountService = require("./account.service");

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ success: false, message: err.message || "Internal server error" });
};

exports.createAccount = async (req, res) => {
  try {
    const {
      userId,
      accountType,
      branch,
      balance,
      interestRate,
      currency,
      overdraftLimit,
      minimumBalance,
    } = req.body;
    const account = await accountService.createAccount(userId, {
      accountType,
      branch,
      balance,
      interestRate,
      currency,
      overdraftLimit,
      minimumBalance,
    });
    return success(res, { message: "Account created", data: account, statusCode: 201 });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
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
    handleError(res, err);
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
    handleError(res, err);
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
    handleError(res, err);
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await accountService.deleteAccount(req.params.accountNumber);
    return success(res, { message: "Account closed successfully." });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};

exports.deposit = async (req, res) => {
  const { accountNumber, amount, description } = req.body;
  const amountError = checkAmount(res, amount, "deposit");
  if (amountError) return amountError;

  try {
    const result = await accountService.deposit(
      accountNumber,
      amount,
      description,
      req.user.id,
      req.user.role,
    );
    return success(res, { message: "Deposit successful", data: result });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};

exports.withdraw = async (req, res) => {
  const { accountNumber, amount, description } = req.body;
  const amountError = checkAmount(res, amount, "withdraw");
  if (amountError) return amountError;

  try {
    const result = await accountService.withdraw(
      accountNumber,
      amount,
      description,
      req.user.id,
      req.user.role,
    );
    return success(res, { message: "Withdrawal successful", data: result });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};

exports.airdrop = async (req, res) => {
  const { accountNumber, amount, description } = req.body;
  const amountError = checkAmount(res, amount, "airdrop");
  if (amountError) return amountError;

  try {
    const result = await accountService.airdrop(
      accountNumber,
      amount,
      description,
      req.user.id,
    );
    return success(res, { message: "Airdrop successful", data: result });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
  }
};
