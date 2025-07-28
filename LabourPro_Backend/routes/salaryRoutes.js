// routes/salaryRoutes.js
const express = require("express");
const router = express.Router();
const { generateMonthlySalary, getAllSalaries } = require("../controllers/salaryController");
const {protect,isAdmin} = require("../middlewares/auth");

router.get("/generate/:month", protect,isAdmin, generateMonthlySalary); // e.g., /generate/2025-07
router.get("/", protect,isAdmin, getAllSalaries);

module.exports = router;
