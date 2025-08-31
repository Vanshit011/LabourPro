const ManagerSalary = require("../models/ManagerSalary");
const Manager = require("../models/Manager");

// POST /api/salaries/add
const addSalary = async (req, res) => {
  try {
    const { managerId, month, year } = req.body;

    // ✅ Fetch Manager details
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }

    const companyId = manager.companyId;
    const baseSalary = manager.salary;

    // ✅ Prevent duplicate salary for same month
    const exists = await ManagerSalary.findOne({ managerId, month, year });
    if (exists) {
      return res.status(400).json({ error: "Salary already exists for this month" });
    }

    // ✅ Get last month's salary (loan carry forward)
    const lastSalary = await ManagerSalary.findOne({ managerId }).sort({ year: -1, month: -1 });

    let carryForwardLoan = 0;
    if (lastSalary) {
      // Previous month’s remaining loan = oldRemaining - paid
      const adjustedRemaining = lastSalary.loanRemaining ;
      carryForwardLoan = adjustedRemaining > 0 ? adjustedRemaining : 0;
    }

    // ✅ Create new salary
    const newSalary = new ManagerSalary({
      companyId,
      managerId,
      month,
      year,
      baseSalary,
      advance: 0,
      loanTaken: 0,
      loanPaid: 0,
      loanRemaining: carryForwardLoan,
      finalSalary: baseSalary , // reduce from salary
    });

    await newSalary.save();

    res.json({ message: "Salary added successfully", salary: newSalary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /salary/:id/update
const updateSalary = async (req, res) => {
  try {
    const { advance, loanTaken, loanPaid } = req.body;

    let salary = await ManagerSalary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary entry not found" });

    salary.advance += advance || 0;
    salary.loanTaken += loanTaken || 0;
    salary.loanPaid += loanPaid || 0;

    // Calculate loan remaining
    salary.loanRemaining = (salary.loanRemaining + salary.loanTaken) - salary.loanPaid;

    // Calculate final salary
    salary.finalSalary = salary.baseSalary - salary.advance - salary.loanPaid;

    await salary.save();

    res.json({ message: "Salary updated successfully", salary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /salary/:managerId/:month/:year
const getSalary = async (req, res) => {
  const { managerId, month, year } = req.params;
  const salary = await ManagerSalary.findOne({ managerId, month, year });
  res.json(salary);
};

module.exports = { addSalary,getSalary, updateSalary };