const cron = require("node-cron");
const Manager = require("../models/Manager");
const ManagerSalary = require("../models/ManagerSalary");

cron.schedule("5 0 1 * *", async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const managers = await Manager.find();

  for (let manager of managers) {
    // Check last month loan
    const lastMonth = await ManagerSalary.findOne({
      managerId: manager._id
    }).sort({ createdAt: -1 });

    let carryForwardLoan = lastMonth ? lastMonth.loanRemaining : 0;

    // New entry
    const newSalary = new ManagerSalary({
      companyId: manager.companyId,
      managerId: manager._id,
      month,
      year,
      baseSalary: manager.salary || 0,
      advance: 0,
      loanTaken: 0,
      loanPaid: 0,
      loanRemaining: carryForwardLoan,
      finalSalary: manager.baseSalary - carryForwardLoan
    });

    await newSalary.save();
  }

  console.log("✅ Monthly salaries auto-created for all managers.");
});
