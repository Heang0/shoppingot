import Store from '../models/Store.js';
import Order from '../models/Order.js'; 
import User from '../models/User.js';

// @desc    Get all users for platform management
// @route   GET /api/superadmin/users
// @access  Private/Superadmin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get dashboard stats
// @route   GET /api/superadmin/dashboard
// @access  Private/Superadmin
export const getDashboardStats = async (req, res) => {
  try {
    const totalStores = await Store.countDocuments();
    
    // Active subscriptions are stores with plan.isActive = true
    const activeSubscriptions = await Store.countDocuments({ 'plan.isActive': true });

    // Mock monthly revenue for now, or calculate based on active subscriptions if plans are populated.
    // Let's populate the plan to calculate revenue
    const storesWithPlans = await Store.find({ 'plan.isActive': true }).populate('plan.planId');
    const monthlyRevenue = storesWithPlans.reduce((acc, store) => {
      return acc + (store.plan?.planId?.price || 0);
    }, 0);

    res.json({
      totalStores,
      activeSubscriptions,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle store status
// @route   PUT /api/superadmin/stores/:id/toggle
// @access  Private/Superadmin
export const toggleStoreStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.isActive = !store.isActive;
    const updatedStore = await store.save();

    res.json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store custom domain (Superadmin)
// @route   PUT /api/superadmin/stores/:id/domain
// @access  Private/Superadmin
export const updateStoreDomain = async (req, res) => {
  const { customDomain } = req.body;
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    
    if (customDomain !== undefined && customDomain !== store.customDomain) {
      const vercelToken = process.env.VERCEL_API_TOKEN;
      const vercelProjectId = process.env.VERCEL_PROJECT_ID;
      const vercelTeamId = process.env.VERCEL_TEAM_ID; // Optional, only if project is inside a Vercel Team
      
      const teamQuery = vercelTeamId ? `?teamId=${vercelTeamId}` : '';

      // 1. If there's an existing domain, and we have Vercel credentials, REMOVE it from Vercel
      if (store.customDomain && vercelToken && vercelProjectId) {
        try {
          await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${store.customDomain}${teamQuery}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${vercelToken}` }
          });
        } catch (err) {
          console.error('Failed to remove domain from Vercel:', err);
        }
      }

      // 2. Add the NEW domain to Vercel
      if (customDomain !== '') {
        const domainExists = await Store.findOne({ customDomain });
        if (domainExists) return res.status(400).json({ message: 'Custom domain already taken' });
        
        // Add to Vercel
        if (vercelToken && vercelProjectId) {
          try {
            const vercelRes = await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}/domains${teamQuery}`, {
              method: 'POST',
              headers: { 
                Authorization: `Bearer ${vercelToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name: customDomain })
            });
            if (!vercelRes.ok) {
              const errorData = await vercelRes.json();
              console.error('Vercel API Error:', errorData);
              return res.status(400).json({ message: `Vercel Error: ${errorData.error?.message || 'Could not add domain'}` });
            }
          } catch (err) {
            console.error('Failed to add domain to Vercel:', err);
            return res.status(500).json({ message: 'Failed to connect to Vercel API' });
          }
        } else {
          console.warn('VERCEL_API_TOKEN or VERCEL_PROJECT_ID is missing in .env. Domain saved to DB but not added to Vercel.');
        }
        
        store.customDomain = customDomain;
      } else {
        store.customDomain = undefined;
      }
      await store.save();
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

