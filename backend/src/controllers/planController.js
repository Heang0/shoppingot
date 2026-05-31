import SubscriptionPlan from '../models/SubscriptionPlan.js';

// @desc    Get all plans
// @route   GET /api/superadmin/plans
// @access  Public
const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a plan
// @route   POST /api/superadmin/plans
// @access  Private/Superadmin
const createPlan = async (req, res) => {
  try {
    const plan = new SubscriptionPlan(req.body);
    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a plan
// @route   PUT /api/superadmin/plans/:id
// @access  Private/Superadmin
const updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (plan) {
      Object.assign(plan, req.body);
      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/superadmin/plans/:id
// @access  Private/Superadmin
const deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (plan) {
      await plan.deleteOne();
      res.json({ message: 'Plan removed' });
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getPlans, createPlan, updatePlan, deletePlan };
