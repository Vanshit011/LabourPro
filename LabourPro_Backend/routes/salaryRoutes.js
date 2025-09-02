const express = require("express");
const router = express.Router();
const { addSalary, updateSalary, getSalary } = require("../controllers/salaryController");
const Manager = require("../models/Manager");

// Routes

router.post('/add', addSalary);
router.put('/:id/update', updateSalary);
router.get('/:managerId/:month/:year', getSalary);
router.get('/getManager', async (req, res) => {
    try {
        const managers = await Manager.find();
        res.json(managers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
