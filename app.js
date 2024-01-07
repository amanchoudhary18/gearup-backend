require("dotenv").config({ path: ".env" });
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
const cors = require("cors");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"));

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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

app.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}`);
});
