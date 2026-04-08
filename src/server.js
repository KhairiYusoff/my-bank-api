// 1. Load environment variables first
require("dotenv").config();

// 2. Core dependencies
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");

// Error handling
const errorHandler = require("./utils/errorHandler");

// 3. Initialize Express app
const app = express();

// 4. Connect to Database
const connectDB = require("./config/db");
connectDB();

// 5. Middleware
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

// 6. Rate Limiting
const { rateLimitMiddleware } = require("./middleware/rateLimitMiddleware");
app.use(rateLimitMiddleware);

// 7. API Documentation
if (process.env.NODE_ENV !== "production") {
  const swaggerSpec = require("./config/swaggerConfig");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 7. Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

// V2 Routes
const authRoutesV2 = require("./routes/v2/authRoutes");
const adminRoutesV2 = require("./routes/v2/adminRoutes");
const userRoutesV2 = require("./routes/v2/userRoutes");

// WebSocket
const { initializeSocket } = require("./services/websocketService");

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

// Define V2 Routes
app.use("/api/v2/auth", authRoutesV2);
app.use("/api/v2/admin", adminRoutesV2);
app.use("/api/v2/users", userRoutesV2);

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// API Documentation Route - Already handled in the NODE_ENV check above

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initializeSocket(server);

// Start server
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
