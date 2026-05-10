// 1. Load environment variables first
require("dotenv").config();

// 2. Core dependencies
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");

// 3. Internal dependencies
const errorHandler = require("./shared/utils/errorHandler");
const connectDB = require("./config/db");
const swaggerSpec = require("./config/swaggerConfig");
const { rateLimitMiddleware } = require("./shared/middleware/rateLimitMiddleware");
const { initializeSocket } = require("./shared/services/websocketService");
const authRoutes = require("./modules/auth/auth.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const accountRoutes = require("./modules/accounts/account.routes");
const transactionRoutes = require("./modules/transactions/transaction.routes");
const userRoutes = require("./modules/users/user.routes");
const expenseRoutes = require("./modules/expenses/expense.routes");
const onboardingRoutes = require("./modules/onboarding/onboarding.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const auditRoutes = require("./modules/audit/audit.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");

// 4. Initialize Express app
const app = express();

// 5. Connect to Database
connectDB();

// 6. Middleware
const corsOptions = {
  origin: [
    process.env.ADMIN_FRONTEND_URL,
    process.env.CUSTOMER_FRONTEND_URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 7. Rate Limiting
app.use(rateLimitMiddleware);

// 8. API Documentation
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 9. Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
initializeSocket(server);
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
