const express = require("express");
const router = express.Router();
const { addSalary, updateSalary, getSalary, addWorkerSalary, updateWorkerSalary, getWorkerSalary, downloadSalaryPDF } = require("../controllers/salaryController");
const Manager = require("../models/Manager");

// manager routes

router.post('/add', addSalary);
router.put('/:id/update', updateSalary);
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
router.get('/worker/:workerId/:month/:year', getWorkerSalary);
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
