const express = require("express");
const router = express.Router();
const {
    addWorker,
    getWorkers,
    updateWorker,
    deleteWorker,
    addManager,
    getManager,
    updateManager,
    deleteManager,
} = require("../controllers/workerController");
const { protect, isAdmin } = require("../middlewares/auth");

// All routes protected by authMiddleware (JWT)
router.post("/add", protect, isAdmin, addWorker);
router.get("/", protect, isAdmin, getWorkers);
router.put("/:id", protect, isAdmin, updateWorker);
router.delete("/:id", protect, isAdmin, deleteWorker);

//manager routes
router.post("/addManager", protect, isAdmin, addManager);
router.get("/getManager", protect, isAdmin, getManager);
router.put("/updateManager/:id", protect, isAdmin, updateManager);
router.delete("/deleteManager/:id", protect, isAdmin, deleteManager);

module.exports = router;
