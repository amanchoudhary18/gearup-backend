const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  location: {
    lat: {
      type: String,
    },
    lng: {
      type: String,
    },
    line1: {
      type: String,
    },
    line2: {
      type: String,
    },
    line3: {
      type: String,
    },
    line4: {
      type: String,
    },
  },
  sportsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
    },
  ],
});

const Venue = mongoose.model("Venue", venueSchema);

module.exports = Venue;
