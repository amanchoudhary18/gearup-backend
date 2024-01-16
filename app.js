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

const chatRouter = require("./routes/chat.route");
app.use("/api/v1/chat", chatRouter);

const messageRouter = require("./routes/message.route");
app.use("/api/v1/message", messageRouter);

http.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}`);
});
