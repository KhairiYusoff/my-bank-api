const { success } = require("../../shared/utils/response");
const { checkAmount } = require("../../shared/utils/validation.helpers");
const transactionService = require("./transaction.service");

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ success: false, message: err.message || "Internal server error" });
};

exports.transferFunds = async (req, res) => {
  const { fromAccountNumber, toAccountNumber, amount, description } = req.body;

  const amountError = checkAmount(res, amount, "transfer");
  if (amountError) return amountError;

  try {
    const result = await transactionService.transferFunds(
      fromAccountNumber,
      toAccountNumber,
      amount,
      description,
      req.user.id,
    );
    return success(res, { message: "Transfer successful", data: result });
  } catch (err) {
    console.error(err.message);
    handleError(res, err);
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
    handleError(res, err);
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
    handleError(res, err);
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
    handleError(res, err);
  }
};
