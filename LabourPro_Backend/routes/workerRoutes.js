const express = require("express");
const router = express.Router();
const {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
} = require("../controllers/workerController");
const { protect } = require("../middlewares/auth");

router.post("/", protect, addWorker);
router.get("/", protect, getWorkers);
router.put("/:id", protect, updateWorker);
router.delete("/:id", protect, deleteWorker);

module.exports = router;
