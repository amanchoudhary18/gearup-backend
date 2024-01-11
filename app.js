require("dotenv").config({ path: ".env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

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

var users = 0;

io.on("connection", (socket) => {
  console.log("A user connected");
  users++;

  io.sockets.emit("broadcast", { message: users + " users connected!" });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    users--;

    io.sockets.emit("broadcast", { message: users + " users connected!" });
  });
});

http.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}`);
});
