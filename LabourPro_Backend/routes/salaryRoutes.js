const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");

router.post("/add", salaryController.addSalary); // Add Salary
router.put("/:id/update", salaryController.updateSalary); // Update Salary
router.get("/:managerId/:month/:year", salaryController.getSalary); // Get Salary

module.exports = router;
