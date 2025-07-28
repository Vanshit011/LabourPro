const express = require("express");
const router = express.Router();
const {
    addWorker,
    getWorkers,
    updateWorker,
    deleteWorker,
} = require("../controllers/workerController");
const { protect, isAdmin } = require("../middlewares/auth");

// All routes protected by authMiddleware (JWT)
router.post("/add", protect, isAdmin, addWorker);
router.get("/", protect, isAdmin, getWorkers);
router.put("/:id", protect, isAdmin, updateWorker);
router.delete("/:id", protect, isAdmin, deleteWorker);

module.exports = router;
