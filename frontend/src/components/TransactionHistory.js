import React, { useState, useEffect, useMemo } from 'react';
import './TransactionHistory.css';
import { apiService } from '../services/apiService';
import { useDebounce } from '../hooks/useDebounce';

const TransactionHistory = ({ account }) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAddress, setFilterAddress] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const debouncedAddress = useDebounce(filterAddress, 300);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Error test for layout and styling
        // throw new Error('Failed to fetch transaction history - testing error state');
        const data = await apiService.getTransactions(null, 100);
        setAllTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      // Filter by wallet address (partial match)
      if (debouncedAddress) {
        const addressLower = debouncedAddress.toLowerCase();
        const matchesFrom = tx.from.toLowerCase().includes(addressLower);
        const matchesTo = tx.to.toLowerCase().includes(addressLower);
        if (!matchesFrom && !matchesTo) return false;
      }

      // Filter by status
      if (filterStatus !== 'all' && tx.status !== filterStatus) {
        return false;
      }

      // Filter by transaction type
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Filter by date range
      if (filterDateFrom || filterDateTo) {
        const txDate = new Date(tx.timestamp);

        if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (txDate < fromDate) return false;
        }

        if (filterDateTo) {
          const toDate = new Date(filterDateTo);
          toDate.setHours(23, 59, 59, 999);
          if (txDate > toDate) return false;
        }
      }

      return true;
    });
  }, [allTransactions, debouncedAddress, filterStatus, filterType, filterDateFrom, filterDateTo]);

  // Truncate address for filter label
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const handleFilterMyWallet = () => {
    if (account) {
      setFilterAddress(account);
    } else {
      alert('Please connect your wallet first');
    }
  };

  const handleClearFilter = () => {
    setFilterAddress('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleInputChange = (e) => {
    setFilterAddress(e.target.value);
  };

  const isFilterActive = filterAddress || filterStatus !== 'all' || filterType !== 'all' || filterDateFrom || filterDateTo;

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        <div className="filter-controls">
          <button
            onClick={handleFilterMyWallet}
            className="filter-button"
            disabled={!account}
            title={!account ? 'Connect wallet to use this feature' : 'Filter to my wallet'}
          >
            My Wallet
          </button>
          <input
            type="text"
            placeholder="Filter by wallet address..."
            value={filterAddress}
            onChange={handleInputChange}
            className="wallet-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="consent_approval">Consent Approval</option>
            <option value="data_access">Data Access</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="date-input"
            placeholder="From date"
          />
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="date-input"
            placeholder="To date"
          />
          <button
            onClick={handleClearFilter}
            className="filter-button clear"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="active-filters">
        {filterAddress && (
          <span className="filter-tag">
            Address: {formatAddress(filterAddress)}
          </span>
        )}
        {filterType !== 'all' && (
          <span className="filter-tag">
            Type: {filterType.replace('_', ' ')}
          </span>
        )}
        {filterStatus !== 'all' && (
          <span className="filter-tag">
            Status: {filterStatus}
          </span>
        )}
        {(filterDateFrom || filterDateTo) && (
          <span className="filter-tag">
            Date: {filterDateFrom || '...'} to {filterDateTo || '...'}
          </span>
        )}
      </div>

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="placeholder">
            <p>No transactions found</p>
            <p>{isFilterActive ? 'No transactions match your filters' : 'No transactions available'}</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="transaction-header-info">
                <span className={`transaction-type ${tx.type}`}>
                  {tx.type.replace('_', ' ')}
                </span>
                <span className={`transaction-status ${tx.status}`}>
                  {tx.status}
                </span>
              </div>

              <div className="transaction-details">
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">From</span>
                  <span className="transaction-detail-value address">{tx.from}</span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">To</span>
                  <span className="transaction-detail-value address">{tx.to}</span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Amount</span>
                  <span className="transaction-detail-value transaction-amount">
                    {tx.amount} {tx.currency}
                  </span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Timestamp</span>
                  <span className="transaction-detail-value transaction-timestamp">
                    {formatDate(tx.timestamp)}
                  </span>
                </div>
              </div>

              <div className="transaction-details">
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Transaction Hash</span>
                  <span className="transaction-detail-value hash">{tx.blockchainTxHash}</span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Block Number</span>
                  <span className="transaction-detail-value">{tx.blockNumber?.toLocaleString()}</span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Gas Used</span>
                  <span className="transaction-detail-value">{tx.gasUsed}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;


