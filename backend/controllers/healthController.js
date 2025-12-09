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

    // Generate historical data dynamically from actual createdAt timestamps
    const events = [];

    // Collect all events with their timestamps
    (data.patients || []).forEach(patient => {
      if (patient.createdAt) {
        events.push({
          timestamp: new Date(patient.createdAt),
          type: 'patient'
        });
      }
    });

    (data.records || []).forEach(record => {
      if (record.date) {
        events.push({
          timestamp: new Date(record.date),
          type: 'record'
        });
      }
    });

    (data.consents || []).forEach(consent => {
      if (consent.createdAt) {
        events.push({
          timestamp: new Date(consent.createdAt),
          type: 'consent',
          status: consent.status
        });
      }
    });

    (data.transactions || []).forEach(transaction => {
      if (transaction.timestamp) {
        events.push({
          timestamp: new Date(transaction.timestamp),
          type: 'transaction'
        });
      }
    });

    // Sort events by timestamp
    events.sort((a, b) => a.timestamp - b.timestamp);

    // Build cumulative history
    const history = [];
    let totalPatients = 0;
    let totalRecords = 0;
    let totalConsents = 0;
    let activeConsents = 0;
    let pendingConsents = 0;
    let totalTransactions = 0;

    events.forEach(event => {
      switch (event.type) {
        case 'patient':
          totalPatients++;
          break;
        case 'record':
          totalRecords++;
          break;
        case 'consent':
          totalConsents++;
          if (event.status === 'active') {
            activeConsents++;
          } else if (event.status === 'pending') {
            pendingConsents++;
          }
          break;
        case 'transaction':
          totalTransactions++;
          break;
      }

      // Add snapshot to history
      history.push({
        timestamp: event.timestamp.toISOString(),
        totalPatients,
        totalRecords,
        totalConsents,
        activeConsents,
        pendingConsents,
        totalTransactions
      });
    });

    // Deduplicate consecutive identical values - keep only first and last of each sequence
    const deduplicatedHistory = [];
    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const prev = history[i - 1];
      const next = history[i + 1];

      // Always include the first point
      if (i === 0) {
        deduplicatedHistory.push(current);
        continue;
      }

      // Always include the last point
      if (i === history.length - 1) {
        deduplicatedHistory.push(current);
        continue;
      }

      // Check if all metrics are the same as previous
      const sameAsPrev = prev &&
        current.totalPatients === prev.totalPatients &&
        current.totalRecords === prev.totalRecords &&
        current.totalConsents === prev.totalConsents &&
        current.activeConsents === prev.activeConsents &&
        current.pendingConsents === prev.pendingConsents &&
        current.totalTransactions === prev.totalTransactions;

      // Check if all metrics are the same as next
      const sameAsNext = next &&
        current.totalPatients === next.totalPatients &&
        current.totalRecords === next.totalRecords &&
        current.totalConsents === next.totalConsents &&
        current.activeConsents === next.activeConsents &&
        current.pendingConsents === next.pendingConsents &&
        current.totalTransactions === next.totalTransactions;

      // Include if it's different from previous (start of plateau) or different from next (end of plateau)
      if (!sameAsPrev || !sameAsNext) {
        deduplicatedHistory.push(current);
      }
    }

    // Filter by date range if provided
    let filteredHistory = deduplicatedHistory;
    if (fromDate || toDate) {
      filteredHistory = deduplicatedHistory.filter(stat => {
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

    res.json({ history: filteredHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  healthCheck,
  getStats,
  getStatsHistory
};


