require("dotenv").config({ path: ".env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const Chat = require("./models/chat.model");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/testSocket", async (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "index.html";
  res.sendFile(fileName, options);
});

app.get("/api/v1/home", async (req, res) => {
  res.send("Welcome to Gear Up");
});

const userRouter = require("./routes/user.route");
app.use("/api/v1/user", userRouter);

const sportRouter = require("./routes/sport.route");
app.use("/api/v1/sport", sportRouter);

const venueRouter = require("./routes/venue.route");
app.use("/api/v1/venue", venueRouter);

const gameRouter = require("./routes/game.route");
app.use("/api/v1/game", gameRouter);

const connectionRouter = require("./routes/connection.route");
app.use("/api/v1/connection", connectionRouter);

const chatRouter = require("./routes/chat.route");
app.use("/api/v1/chat", chatRouter);

const messageRouter = require("./routes/message.route");
app.use("/api/v1/message", messageRouter);

const bucksRouter = require("./routes/bucks.route");
app.use("/api/v1/bucks", bucksRouter);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    console.log(userData);
    socket.join(userData.toString());
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  setTimeout(() => {
    socket.emit("test", "Test");
  }, 5000);

  socket.on("new message", async (newMessageReceived) => {
    const chat = await Chat.findOne({ _id: newMessageReceived.chat });

    if (!chat.users) {
      return console.log("chat.users not defined");
    }

    chat.users.forEach((user) => {
      if (user != newMessageReceived.sender) {
        return;
      }

      socket.in(user.toString()).emit("message received", newMessageReceived);
    });
  });
});
