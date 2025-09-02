const cron = require('node-cron');
const Manager = require("../models/Manager");
const ManagerSalary = require("../models/ManagerSalary");


// Cron Job for Auto-Generation on 1st of Every Month
cron.schedule('0 0 1 * *', async () => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const managers = await Manager.find();
    for (const manager of managers) {
      // Check if salary already exists for this month/year
      const existingSalary = await ManagerSalary.findOne({
        managerId: manager._id,
        month: currentMonth,
        year: currentYear
      });

      if (!existingSalary) {
        // Get last month's salary for carry forward
        const lastSalary = await ManagerSalary.findOne({ managerId: manager._id }).sort({ year: -1, month: -1 });

        let carryForwardLoan = 0;
        if (lastSalary) {
          const adjustedRemaining = lastSalary.loanRemaining;
          carryForwardLoan = adjustedRemaining > 0 ? adjustedRemaining : 0;
        }

        const newSalary = new ManagerSalary({
          companyId: manager.companyId,
          managerId: manager._id,
          month: currentMonth,
          year: currentYear,
          baseSalary: manager.salary,
          advance: 0,
          loanTaken: 0,
          loanPaid: 0,
          loanRemaining: carryForwardLoan,
          finalSalary: manager.salary
        });
        await newSalary.save();
        console.log(`Salary auto-generated for manager ${manager.name}`);
      }
    }
  } catch (err) {
    console.error('Error auto-generating salaries:', err);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Adjust to IST
});

module.exports = cron;
// Note: This cron job runs at midnight on the 1st of every month (IST)
// It fetches all managers and creates a salary record if one doesn't already exist for the current month/year
// It also carries forward any remaining loan from the previous month
// Ensure to handle edge cases like year change (December to January)
