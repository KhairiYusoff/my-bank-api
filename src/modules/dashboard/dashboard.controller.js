const { success, error } = require("../../shared/utils/response");
const dashboardService = require("./dashboard.service");

exports.getDashboardSummary = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardSummary(req.user.role);
    return success(res, { data });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};
