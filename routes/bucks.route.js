const express = require("express");
const router = express.Router();
const bucksController = require("../controllers/bucks.controller");

// Define routes
router.post("/", bucksController.createBucks);
router.get("/", bucksController.getAllBucks);

// router.get("/:id", bucksController.getBucksById);
// router.put("/:id", bucksController.updateBucks);
// router.delete("/:id", bucksController.deleteBucks);

module.exports = router;
