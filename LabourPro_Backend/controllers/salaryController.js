// controllers/salaryController.js
const Attendance = require("../models/Attendance");
const Salary = require("../models/Salary");
const Worker = require("../models/Worker");

exports.generateMonthlySalary = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { month } = req.params; // Format: "2025-07"

        const startDate = new Date(`${month}-01`);
        const endDate = new Date(`${month}-31`);

        const attendances = await Attendance.find({
            companyId,
            date: { $gte: startDate, $lte: endDate },
        });

        const salaryMap = new Map();

        attendances.forEach((attendance) => {
            const key = attendance.workerId.toString();
            if (!salaryMap.has(key)) {
                salaryMap.set(key, { totalHours: 0, totalRoj: 0 });
            }
            const data = salaryMap.get(key);
            data.totalHours += attendance.totalHours;
            data.totalRoj += attendance.dailyRoj;
        });

        const salaries = [];
        for (let [workerId, data] of salaryMap) {
            const salary = await Salary.findOneAndUpdate(
                { workerId, companyId, month },
                { totalHours: data.totalHours, totalRoj: data.totalRoj },
                { new: true, upsert: true }
            );
            salaries.push(salary);
        }

        res.status(200).json({ message: "Salaries generated", salaries });
    } catch (err) {
        console.error("Salary generation error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getAllSalaries = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        const salaries = await Salary.find({ companyId }).populate("workerId");

        const totalPaid = salaries.reduce((sum, s) => sum + s.totalRoj, 0);

        res.status(200).json({
            totalPaid, // 💰 Total salary paid
            count: salaries.length,
            salaries,
        });
    } catch (err) {
        console.error("Get salaries error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};