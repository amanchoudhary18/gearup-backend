const Bucks = require("../models/buck.model");

// Controller methods
const createBucks = async (req, res) => {
  try {
    const bucksData = req.body;
    const newBucks = new Bucks(bucksData);
    await newBucks.save();
    res.status(201).json(newBucks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllBucks = async (req, res) => {
  try {
    const bucks = await Bucks.find();
    res.json(bucks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBucksById = async (req, res) => {
  try {
    const bucks = await Bucks.findById(req.params.id);
    if (!bucks) {
      return res.status(404).json({ message: "Bucks not found" });
    }
    res.json(bucks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBucks = async (req, res) => {
  try {
    const updatedBucks = await Bucks.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBucks) {
      return res.status(404).json({ message: "Bucks not found" });
    }
    res.json(updatedBucks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBucks = async (req, res) => {
  try {
    const deletedBucks = await Bucks.findByIdAndDelete(req.params.id);
    if (!deletedBucks) {
      return res.status(404).json({ message: "Bucks not found" });
    }
    res.json({ message: "Bucks deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBucks,
  getAllBucks,
  getBucksById,
  updateBucks,
  deleteBucks,
};
