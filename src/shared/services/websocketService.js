const socketIo = require("socket.io");

let io;

// Store connected admin/banker members
const connectedStaff = new Map(); // Maps socketId -> {userId, role}

// Store connected customers
const connectedCustomers = new Map(); // Maps socketId -> userId

const STAFF_ROLES = ["admin", "banker"];

// Initialize socket.io
const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? [process.env.ADMIN_FRONTEND_URL, process.env.CUSTOMER_FRONTEND_URL]
          : [
              process.env.ADMIN_FRONTEND_URL,
              process.env.CUSTOMER_FRONTEND_URL,
              "http://localhost:5173",
              "http://localhost:5174",
              "http://127.0.0.1:5173",
              "http://127.0.0.1:5174",
            ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected, ID:", socket.id);

    // Handle any message
    socket.onAny((eventName, ...args) => {
      console.log("Received event:", eventName, "with args:", args);
    });

    // Staff authentication
    socket.on("staffAuth", (data) => {
      try {
        console.log("Received staffAuth with data:", data);

        // Parse data if it's a string
        const authData = typeof data === "string" ? JSON.parse(data) : data;

        if (STAFF_ROLES.includes(authData.role)) {
          // Store staff info
          connectedStaff.set(socket.id, {
            _id: authData._id,
            role: authData.role,
          });

          socket.join(authData.role);

          // Send confirmation back to client
          socket.emit("authSuccess", { message: "Authentication successful" });

          console.log(`${authData.role} ${authData._id} connected`);
        } else {
          console.log("Invalid role:", authData.role);
          socket.emit("authError", { message: "Invalid role" });
        }
      } catch (error) {
        console.error("Error in staffAuth:", error);
        socket.emit("authError", { message: "Authentication failed" });
      }
    });

    // Customer: join personal notification room
    socket.on("join_user_room", (userId) => {
      if (!userId) return;
      const room = `user:${userId}`;
      socket.join(room);
      connectedCustomers.set(socket.id, userId);
      console.log(`Customer ${userId} joined room ${room}`);
    });

    // Customer: leave personal notification room
    socket.on("leave_user_room", (userId) => {
      if (!userId) return;
      socket.leave(`user:${userId}`);
      connectedCustomers.delete(socket.id);
      console.log(`Customer ${userId} left room user:${userId}`);
    });

    socket.on("disconnect", () => {
      if (connectedStaff.has(socket.id)) {
        const staff = connectedStaff.get(socket.id);
        console.log(`${staff.role} ${staff._id} disconnected`);
        connectedStaff.delete(socket.id);
      }
      if (connectedCustomers.has(socket.id)) {
        connectedCustomers.delete(socket.id);
      }
      console.log("Client disconnected");
    });
  });

  return io;
};

// Notify admin and banker about new application
const notifyNewApplication = (application) => {
  if (io) {
    // Send to both admin and banker rooms
    STAFF_ROLES.forEach((role) => {
      io.to(role).emit("newApplication", {
        message: `New customer application received (sent to ${role}s)`,
        application: {
          id: application._id,
          name: application.name,
          email: application.email,
          createdAt: application.createdAt,
        },
      });
    });
  }
};

// Emit a notification event to a specific customer room
const notifyCustomer = (userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
};

module.exports = {
  initializeSocket,
  notifyNewApplication,
  notifyCustomer,
};
