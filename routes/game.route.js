const express = require("express");
const router = express.Router();
const GameController = require("../controllers/game.controller");
const userAuth = require("../middleware/userAuth");

// create game
router.post("/create", userAuth, GameController.createGame);

// get games
router.get("/games", userAuth, GameController.getGames);

// get my games
router.get("/mygames", userAuth, GameController.getMyGames);

// update game + add ratings
router.post("/updateGame/:id", userAuth, GameController.updateGame);

// Route for getting recent games
router.get("/recentGames", userAuth, GameController.getRecentGames);

// Route for getting live games
router.get("/liveGames", userAuth, GameController.getLiveGames);

// Route for getting upcoming games
router.get("/upcomingGames", userAuth, GameController.getUpcomingGames);

module.exports = router;
