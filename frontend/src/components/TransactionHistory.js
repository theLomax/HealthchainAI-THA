import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';
import { apiService } from '../services/apiService';

const TransactionHistory = ({ account }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Error test for layout and styling
        // throw new Error('Failed to fetch transaction history - testing error state');
        // TODO: Call apiService.getTransactions with account address if available

        const data = await apiService.getTransactions(account);
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [account]);

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

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        {account && (
          <div className="wallet-filter">
            Filtering for: {formatAddress(account)}
          </div>
        )}
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="placeholder">
            <p>No transactions found</p>
            <p>{account ? 'No transactions for this wallet address' : 'Connect your wallet to view transactions'}</p>
          </div>
        ) : (
          transactions.map((tx) => (
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


