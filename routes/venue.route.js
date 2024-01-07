const express = require("express");
const router = express.Router();
const Venue = require("../models/venue.model");

// create venue
router.post("/create", async (req, res) => {
  try {
    const { name, img, location, sportsList } = req.body;

    const newVenue = await Venue.create({
      name,
      img,
      location,
      sportsList,
    });

    res.status(201).json({ status: "Successful", venue: newVenue });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
});

// list venues
router.get("/venues", async (req, res) => {
  try {
    const allVenues = await Venue.find().populate("sportsList");
    res.status(200).json({ status: "Successful", venues: allVenues });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
});

module.exports = router;
