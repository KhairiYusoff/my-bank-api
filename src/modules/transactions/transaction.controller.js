const { success, error } = require("../../shared/utils/response");
const { checkAmount } = require("../../shared/utils/validation.helpers");
const transactionService = require("./transaction.service");

exports.transferFunds = async (req, res) => {
  const { fromAccountNumber, toAccountNumber, amount, memo } = req.body;

  const amountError = checkAmount(res, amount, "transfer");
  if (amountError) return amountError;

  try {
    const result = await transactionService.transferFunds(
      fromAccountNumber,
      toAccountNumber,
      amount,
      memo,
      req.user.id,
      req.user.role,
      req.ip,
      req.headers["user-agent"],
    );

    // Explicit response shape — customers see masked counterpart details
    return success(res, {
      message: "Transfer successful",
      data: {
        reference: result.reference,
        amount: result.amount,
        balanceAfter: result.balanceAfter,
        counterpartAccount: result.counterpartAccount,
        counterpartName: result.counterpartName,
        date: result.date,
      },
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getAccountTransactions = async (req, res) => {
  const { accountNumber } = req.params;
  const { page = 1, limit = 10, sort = "desc" } = req.query;

  try {
    const result = await transactionService.getAccountTransactions(
      accountNumber,
      req.user,
      page,
      limit,
      sort,
    );
    return success(res, {
      message: "Transactions fetched successfully",
      data: result.transactions,
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

exports.getAllTransactions = async (req, res) => {
  try {
    const result = await transactionService.getAllTransactions(req.query);
    return success(res, {
      data: result.transactions,
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

exports.getTransactionDetails = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await transactionService.getTransactionDetails(
      transactionId,
      req.user,
    );
    return success(res, { data: transaction });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};
