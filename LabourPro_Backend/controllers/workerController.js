const Worker = require("../models/Worker");

exports.addWorker = async (req, res) => {
  try {
    const { name, contact, role, salary } = req.body;
    const companyId = req.user.companyId;

    if (!name || !role) return res.status(400).json({ message: "Name and role are required" });

    const worker = await Worker.create({ name, contact, role, salary, companyId });
    res.status(201).json({ message: "Worker added", worker });
  } catch (err) {
    res.status(500).json({ message: "Failed to add worker" });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const workers = await Worker.find({ companyId });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workers" });
  }
};

exports.updateWorker = async (req, res) => {
  try {
    const { name, contact, role, salary } = req.body;
    const { id } = req.params;
    const companyId = req.user.companyId;

    const worker = await Worker.findOneAndUpdate(
      { _id: id, companyId },
      { name, contact, role, salary },
      { new: true }
    );

    if (!worker) return res.status(404).json({ message: "Worker not found" });

    res.json({ message: "Worker updated", worker });
  } catch (err) {
    res.status(500).json({ message: "Failed to update worker" });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const deleted = await Worker.findOneAndDelete({ _id: id, companyId });

    if (!deleted) return res.status(404).json({ message: "Worker not found" });

    res.json({ message: "Worker deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete worker" });
  }
};
