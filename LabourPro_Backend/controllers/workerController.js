const Worker = require("../models/Worker");

// ✅ Add Worker
exports.addWorker = async (req, res) => {
  try {
    const { name, number, role, rojPerHour, email, password } = req.body;
    const companyId = req.user.companyId;

    // Check if email already exists
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const worker = new Worker({
      name,
      number,
      role,
      rojPerHour,
      email,
      password,
      companyId,
    });

    await worker.save();

    res.status(201).json({ message: "Worker added successfully", worker });
  } catch (error) {
    console.error("Error adding worker:", error);
    res.status(500).json({ error: error.message });
  }
};



// ✅ Get All Workers (for company)
exports.getWorkers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const workers = await Worker.find({ companyId });
    res.status(200).json(workers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Worker
exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const updated = await Worker.findOneAndUpdate(
      { _id: id, companyId },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Worker not found" });

    res.status(200).json({ message: "Worker updated", worker: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Worker
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const deleted = await Worker.findOneAndDelete({ _id: id, companyId });

    if (!deleted) return res.status(404).json({ message: "Worker not found" });

    res.status(200).json({ message: "Worker deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
