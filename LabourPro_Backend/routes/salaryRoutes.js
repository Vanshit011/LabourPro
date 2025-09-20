const express = require("express");
const router = express.Router();
const Manager = require("../models/Manager");
const Worker = require("../models/Worker");
const {
  downloadAllSalaries,
  addSalary,
  updateSalary,
  deleteManagerSalary,
  getSalary,
  downloadSalaryPDF,
} = require("../controllers/salaryController");

const {
  downloadAllWorkerSalaries,
  addWorkerSalary,
  updateWorkerSalary,
  deleteWorkerSalary,
  getWorkerSalary,
  downloadWorkerSalaryPDF,
} = require("../controllers/salaryController");

// -------------------
// Worker Routes
// -------------------

// Static routes first
router.get("/worker/getWorker", async (req, res) => {
  try {
    const workers = await Worker.find();
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/worker/add", addWorkerSalary);
router.get("/downloadAllWorkers/:month/:year", downloadAllWorkerSalaries);
router.get("/worker/:workerId/:month/:year/download", downloadWorkerSalaryPDF);

// Dynamic routes last
router.put("/worker/:id/update", updateWorkerSalary);
router.delete("/worker/:id/delete", deleteWorkerSalary);
router.get("/worker/:workerId/:month/:year", getWorkerSalary);


// -------------------
// Manager Routes
// -------------------

// Static routes first
router.get("/getManager", async (req, res) => {
  try {
    const managers = await Manager.find();
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/downloadAll/:month/:year", downloadAllSalaries);
router.post("/add", addSalary);
router.delete("/manager/:id/delete", deleteManagerSalary);

// Worker download routes should not conflict
router.get("/:managerId/:month/:year/download", downloadSalaryPDF);

// Dynamic routes last
router.put("/:id/update", updateSalary);
router.get("/:managerId/:month/:year", getSalary);


module.exports = router;
