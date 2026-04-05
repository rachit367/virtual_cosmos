require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;
const PROXIMITY_RADIUS = 150;
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

const players = {};

function getRandomColor() {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#F0B27A",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getNearbyPlayers(socketId) {
  const me = players[socketId];
  if (!me) return [];

  const nearby = [];
  for (const [id, player] of Object.entries(players)) {
    if (id === socketId) continue;
    if (getDistance(me, player) < PROXIMITY_RADIUS) {
      nearby.push(id);
    }
  }
  return nearby;
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection failed:", err.message));

app.get("/", (req, res) => {
  res.json({ status: "Virtual Cosmos server is running!" });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", async ({ username }) => {
    const x = Math.floor(Math.random() * (WORLD_WIDTH - 200)) + 100;
    const y = Math.floor(Math.random() * (WORLD_HEIGHT - 200)) + 100;
    const color = getRandomColor();

    players[socket.id] = { username, x, y, color };

    try {
      await User.findOneAndUpdate(
        { username },
        { lastX: x, lastY: y, color },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.log("Could not save user to DB:", err.message);
    }

    socket.emit("currentPlayers", players);

    socket.broadcast.emit("playerJoined", {
      socketId: socket.id,
      username,
      x,
      y,
      color,
    });

    console.log(`${username} joined at (${x}, ${y})`);
  });

  socket.on("playerMove", ({ x, y }) => {
    if (!players[socket.id]) return;

    players[socket.id].x = x;
    players[socket.id].y = y;

    socket.broadcast.emit("playerMoved", {
      socketId: socket.id,
      x,
      y,
    });
  });

  socket.on("chatMessage", ({ message }) => {
    if (!players[socket.id]) return;

    const sender = players[socket.id].username;
    const msgData = {
      sender,
      message,
      timestamp: Date.now(),
    };

    const nearbyIds = getNearbyPlayers(socket.id);

    nearbyIds.forEach((id) => {
      io.to(id).emit("chatMessage", msgData);
    });

    socket.emit("chatMessage", msgData);
  });

  socket.on("disconnect", async () => {
    const player = players[socket.id];
    if (player) {
      try {
        await User.findOneAndUpdate(
          { username: player.username },
          { lastX: player.x, lastY: player.y }
        );
      } catch (err) {
        console.log("Could not save position on disconnect:", err.message);
      }

      console.log(`${player.username} left the cosmos`);
      delete players[socket.id];

      io.emit("playerLeft", { socketId: socket.id });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
