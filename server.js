require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const GroupMessage = require("./models/GroupMessage");
const PrivateMessage = require("./models/PrivateMessage");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());
app.use(express.static("views"));
app.use(express.static("public"));

/* ---------------- MongoDB Connection ---------------- */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

/* ---------------- Signup ---------------- */
app.post("/signup", async (req, res) => {

  try {

    const existingUser = await User.findOne({ username: req.body.username });

    if(existingUser){
      return res.status(400).send("Username already exists");
    }

    const user = new User(req.body);
    await user.save();

    res.send("Signup successful");

  } catch(err){
    res.status(500).send("Signup failed");
  }

});

/* ---------------- Login ---------------- */
app.post("/login", async (req, res) => {

  try {

    const user = await User.findOne({
      username: req.body.username,
      password: req.body.password
    });

    if(!user){
      return res.status(401).send("Invalid login");
    }

    res.send("Login successful");

  } catch(err){
    res.status(500).send("Login error");
  }

});

/* ---------------- Socket Chat ---------------- */
io.on("connection", socket => {

  console.log("🟢 User connected");

  /* Join Room */
  socket.on("joinRoom", room => {

    socket.join(room);

    socket.currentRoom = room;

    console.log(`User joined room: ${room}`);

  });

  /* Leave Room */
  socket.on("leaveRoom", () => {

    if(socket.currentRoom){
      socket.leave(socket.currentRoom);
      console.log(`User left room: ${socket.currentRoom}`);
    }

  });

  /* Group Message */
  socket.on("chatMessage", async data => {

    try {

      const msg = new GroupMessage(data);
      await msg.save();

      io.to(data.room).emit("message", data);

    } catch(err){
      console.log("Message save error:", err);
    }

  });

  /* Private Message */
  socket.on("privateMessage", async data => {

    try {

      const msg = new PrivateMessage(data);
      await msg.save();

      io.emit("privateMessage", data);

    } catch(err){
      console.log("Private message error:", err);
    }

  });

  /* Typing Indicator */
  socket.on("typing", room => {
    socket.to(room).emit("typing");
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });

});

/* ---------------- Server Start ---------------- */
server.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});