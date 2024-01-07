const Sport = require("../models/sport.model");

exports.createSport = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Name is required" });
    }

    const existingSport = await Sport.findOne({ name });

    if (existingSport) {
      return res.status(400).json({
        status: "Failed",
        message: "Sport with this name already exists",
      });
    }

    const newSport = new Sport({ name });
    await newSport.save();

    res.status(201).json({
      status: "Successful",
      message: "Sport created successfully",
      data: newSport,
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

exports.getSports = async (req, res) => {
  try {
    const sports = await Sport.find();
    res.status(200).json({
      status: "Successful",
      message: "Fetched all sports",
      sports,
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};
