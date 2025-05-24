const socketIo = require("socket.io");

let io;

// Store connected admin/banker members
const connectedStaff = new Map(); // Maps socketId -> {userId, role}

const STAFF_ROLES = ["admin", "banker"];

// Initialize socket.io
const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // In production, set this to your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    // Staff authentication
    socket.on("staffAuth", (data) => {
      if (STAFF_ROLES.includes(data.role)) {
        // Store staff info
        connectedStaff.set(socket.id, {
          _id: data._id,
          role: data.role,
        });

        // Join role-specific room
        socket.join(data.role); // 'admin' or 'banker' room
        console.log(`${data.role} ${data._id} connected`);
      }
    });

    socket.on("disconnect", () => {
      if (connectedStaff.has(socket.id)) {
        const staff = connectedStaff.get(socket.id);
        console.log(`${staff.role} ${staff._id} disconnected`);
        connectedStaff.delete(socket.id);
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

module.exports = {
  initializeSocket,
  notifyNewApplication,
};
