const ActivityLog = require("../../shared/models/ActivityLog");
const { success, error } = require("../../shared/utils/response");

/**
 * Get own activity logs (for the authenticated user)
 */
exports.getOwnActivity = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      status,
      severity,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { user: req.user.id };

    if (action) query.action = action;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ["createdAt", "action", "status", "severity"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;

    const total = await ActivityLog.countDocuments(query);
    const activities = await ActivityLog.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "name email") // Populated for human-readable logs
      .populate("relatedEntity", "accountNumber name email");

    const formattedActivities = activities.map((activity) => activity.format());

    return success(res, {
      message: "User activities fetched",
      data: formattedActivities,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error in getOwnActivity:", err);
    return error(res, { message: "Internal server error", statusCode: 500 });
  }
};

/**
 * Get activity logs for a specific user (Admin/Banker only)
 */
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      action,
      status,
      severity,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { user: userId };

    if (action) query.action = action;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ["createdAt", "action", "status", "severity"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;

    const total = await ActivityLog.countDocuments(query);
    const activities = await ActivityLog.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "name email")
      .populate("relatedEntity", "accountNumber name email");

    const formattedActivities = activities.map((activity) => activity.format());

    return success(res, {
      message: "User activities fetched",
      data: formattedActivities,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error in getUserActivity:", err);
    return error(res, { message: "Internal server error", statusCode: 500 });
  }
};

/**
 * Get all activity logs in the system (Admin only)
 */
exports.getAllActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      status,
      severity,
      startDate,
      endDate,
      userId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (userId) query.user = userId;
    if (action) query.action = action;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ["createdAt", "action", "status", "severity"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;

    const total = await ActivityLog.countDocuments(query);
    const activities = await ActivityLog.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "name email")
      .populate("relatedEntity", "accountNumber name email");

    const formattedActivities = activities.map((activity) => activity.format());

    return success(res, {
      message: "All system activities fetched",
      data: formattedActivities,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error in getAllActivities:", err);
    return error(res, { message: "Internal server error", statusCode: 500 });
  }
};
