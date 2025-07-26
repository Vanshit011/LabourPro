const Subscription = require("../models/Subscription");

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { companyId } = req.user;
    const sub = await Subscription.findOne({ companyId });

    if (!sub) return res.status(404).json({ message: "Not found" });

    const expired = new Date(sub.endDate) < new Date();

    res.json({
      plan: sub.planType,
      isTrial: sub.isTrial,
      isActive: sub.isActive && !expired,
      endDate: sub.endDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upgradeTrial = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { planType } = req.body;

    const sub = await Subscription.findOne({ companyId });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    const now = new Date();
    const endDate = new Date(now);

    if (planType === "monthly") endDate.setDate(now.getDate() + 30);
    else if (planType === "yearly") endDate.setFullYear(now.getFullYear() + 1);
    else return res.status(400).json({ message: "Invalid plan type" });

    sub.planType = planType;
    sub.isTrial = false;
    sub.isActive = true;
    sub.startDate = now;
    sub.endDate = endDate;

    await sub.save();
    res.json({ message: "Subscription upgraded", planType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
