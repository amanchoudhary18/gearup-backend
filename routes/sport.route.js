const express = require("express");

const router = express.Router();
const SportController = require("../controllers/sport.controller");

// create sports
router.post("/create", SportController.createSport);

// get sports
router.get("/sports", SportController.getSports);

module.exports = router;
