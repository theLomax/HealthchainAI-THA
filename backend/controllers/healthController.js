const { loadMockData } = require('../utils/dataLoader');

// Health check endpoint
const healthCheck = (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
};

// Get platform statistics
const getStats = async (req, res) => {
  try {
    const data = await loadMockData();

    const stats = {
      totalPatients: (data.patients || []).length,
      totalRecords: (data.records || []).length,
      totalConsents: (data.consents || []).length,
      activeConsents: (data.consents || []).filter(c => c.status === 'active').length,
      pendingConsents: (data.consents || []).filter(c => c.status === 'pending').length,
      totalTransactions: (data.transactions || []).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get historical statistics with optional date range filtering
const getStatsHistory = async (req, res) => {
  try {
    const data = await loadMockData();
    const { fromDate, toDate } = req.query;

    let history = data.statsHistory || [];

    // Filter by date range if provided
    if (fromDate || toDate) {
      history = history.filter(stat => {
        const statDate = new Date(stat.timestamp);

        if (fromDate) {
          const from = new Date(fromDate);
          if (statDate < from) return false;
        }

        if (toDate) {
          const to = new Date(toDate);
          if (statDate > to) return false;
        }

        return true;
      });
    }

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  healthCheck,
  getStats,
  getStatsHistory
};


