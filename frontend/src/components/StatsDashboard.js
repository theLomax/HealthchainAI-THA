import React, { useState, useEffect, useMemo } from 'react';
import './StatsDashboard.css';
import { apiService } from '../services/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Define available metrics with colors
  const metrics = [
    { key: 'totalPatients', label: 'Total Patients', color: '#667eea', description: 'Registered in the system' },
    { key: 'totalRecords', label: 'Total Records', color: '#764ba2', description: 'Medical records stored' },
    { key: 'totalConsents', label: 'Total Consents', color: '#f093fb', description: 'Consent agreements recorded' },
    { key: 'activeConsents', label: 'Active Consents', color: '#4facfe', description: 'Currently active' },
    { key: 'pendingConsents', label: 'Pending Consents', color: '#43e97b', description: 'Awaiting approval' },
    { key: 'totalTransactions', label: 'Total Transactions', color: '#fa709a', description: 'Blockchain transactions' }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await apiService.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set interval to update every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedMetrics.length === 0) {
        setHistoryData([]);
        setIsTransitioning(false);
        return;
      }

      setHistoryLoading(true);
      setIsTransitioning(true);

      try {
        const data = await apiService.getStatsHistory(filterFromDate || null, filterToDate || null);

        // Add small delay to let chart calculate layout before rendering - this prevents layout shift
        await new Promise(resolve => setTimeout(resolve, 100));

        setHistoryData(data.history || []);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setHistoryLoading(false);
        // Keep transition state a bit longer for smooth render
        setTimeout(() => setIsTransitioning(false), 150);
      }
    };

    fetchHistory();
  }, [selectedMetrics, filterFromDate, filterToDate]);

  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        return prev.filter(k => k !== metricKey);
      } else {
        return [...prev, metricKey];
      }
    });
  };

  if (loading) {
    return (
      <div className="stats-dashboard-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-dashboard-container">
        <div className="error">Error loading statistics: {error || 'No data available'}</div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="stats-dashboard-container">
      <h2>Platform Statistics</h2>

      <div className="stats-grid">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className={`stat-card ${selectedMetrics.includes(metric.key) ? 'primary' : ''}`}
            onClick={() => toggleMetric(metric.key)}
            // Click card to add metric to graph
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-label">{metric.label}</div>
            <div className="stat-value">{stats[metric.key]?.toLocaleString()}</div>
            <div className="stat-description">{metric.description}</div>
          </div>
        ))}
      </div>

      <h2>Historical Trends</h2>
      <div className="chart-section" style={{paddingTop: '1rem'}}>
        {selectedMetrics.length > 0 ? (
          <>
            <div className="chart-header">
              <div className="time-range-filters">
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="date-input"
                  placeholder="From date"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="date-input"
                  placeholder="To date"
                />
                <button
                  onClick={() => {
                    setFilterFromDate('');
                    setFilterToDate('');
                  }}
                  className="clear-filter-button"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="chart-container">
              {historyLoading || isTransitioning ? (
                <div className="chart-loading">Loading chart data...</div>
              ) : historyData.length === 0 ? (
                <div className="chart-placeholder">No historical data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={historyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatDate}
                      stroke="#666"
                      style={{ fontSize: '0.85rem' }}
                    />
                    <YAxis
                      stroke="#666"
                      style={{ fontSize: '0.85rem' }}
                    />
                    <Tooltip
                      labelFormatter={formatDate}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '10px'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    {selectedMetrics.map(metricKey => {
                      const metric = metrics.find(m => m.key === metricKey);
                      return (
                        <Line
                          key={metricKey}
                          type="monotone"
                          dataKey={metricKey}
                          name={metric.label}
                          stroke={metric.color}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        ) : (
          <div className="chart-container">
            <div className="chart-placeholder">
              Select metrics above to visualize historical trends
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsDashboard;


