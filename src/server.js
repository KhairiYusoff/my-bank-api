const express = require("express");
const http = require('http');
const cors = require('cors');
const { initializeSocket } = require('./services/websocketService');
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");

// V2 Routes
const authRoutesV2 = require("./routes/v2/authRoutes");
const adminRoutesV2 = require("./routes/v2/adminRoutes");
const userRoutesV2 = require("./routes/v2/userRoutes");

// Swagger for API Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');

require("dotenv").config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

// Define V2 Routes
app.use("/api/v2/auth", authRoutesV2);
app.use("/api/v2/admin", adminRoutesV2);
app.use("/api/v2/users", userRoutesV2);

// API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initializeSocket(server);

// Start server
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
