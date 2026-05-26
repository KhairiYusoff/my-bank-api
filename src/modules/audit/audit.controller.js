const { success, error } = require("../../shared/utils/response");
const { getOwnActivityLogs, getUserActivityLogs, getAllActivityLogs } = require("./audit.service");

exports.getOwnActivity = async (req, res) => {
  try {
    const { activities, meta } = await getOwnActivityLogs(req.user.id, req.query);
    return success(res, { message: "User activities fetched", data: activities, meta });
  } catch (err) {
    console.error("Error in getOwnActivity:", err);
    return error(res, { message: "Internal server error", statusCode: 500 });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const { activities, meta } = await getUserActivityLogs(req.params.userId, req.query);
    return success(res, { message: "User activities fetched", data: activities, meta });
  } catch (err) {
    console.error("Error in getUserActivity:", err);
    return error(res, { message: "Internal server error", statusCode: 500 });
  }
};

exports.getAllActivities = async (req, res) => {
  try {
    const { activities, meta } = await getAllActivityLogs(req.query);
    return success(res, { message: "All system activities fetched", data: activities, meta });
  } catch (err) {
    console.error("Error in getAllActivities:", err);
    return error(res, { message: "Internal server error", statusCode: 500 });
  }
};

