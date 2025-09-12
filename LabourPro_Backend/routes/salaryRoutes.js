const express = require("express");
const router = express.Router();
const { addSalary, updateSalary, getSalary, deleteManagerSalary, addWorkerSalary, updateWorkerSalary, deleteWorkerSalary, getWorkerSalary, downloadSalaryPDF, downloadWorkerSalaryPDF, downloadAllSalaries } = require("../controllers/salaryController");
const Manager = require("../models/Manager");

// manager routes
router.get('/downloadAll/:month/:year', downloadAllSalaries);
router.post('/add', addSalary);
router.put('/:id/update', updateSalary);
router.delete('/manager/:id/delete', deleteManagerSalary);
router.get('/:managerId/:month/:year', getSalary);
router.get('/:managerId/:month/:year/download', downloadSalaryPDF);
router.get('/getManager', async (req, res) => {
    try {
        const managers = await Manager.find();
        res.json(managers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Worker routes

router.post('/worker/add', addWorkerSalary);
router.put('/worker/:id/update', updateWorkerSalary);
router.delete('/worker/:id/delete', deleteWorkerSalary);
router.get('/worker/:workerId/:month/:year/download', downloadWorkerSalaryPDF);
router.get('/worker/:workerId/:month/:year', getWorkerSalary);
// router.post('/worker/recalculate', recalculateWorkerSalary);
router.get('/worker/getWorker', async (req, res) => {
    try {
        const workers = await Worker.find();
        res.json(workers);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
