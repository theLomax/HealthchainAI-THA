import React, { useState, useEffect, useCallback } from 'react';
import './PatientList.css';
import { apiService } from '../services/apiService';
import { useDebounce } from '../hooks/useDebounce';
import { calculateAge, formatYear } from '../utils/dateUtils';

const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // TODO: Implement the fetchPatients function
  // This function should:
  // 1. Call apiService.getPatients with appropriate parameters (page, limit, search)
  // 2. Update the patients state with the response data
  // 3. Update the pagination state
  // 4. Handle loading and error states
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Call API and update state
      const data = await apiService.getPatients({
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm,
      });
      setPatients(data.patients || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Reset to the first page whenever a new search is performed
  useEffect(() => {
    // We check debouncedSearchTerm to avoid resetting on initial load
    if (debouncedSearchTerm !== '') {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  // TODO: Implement search functionality
  // Add a debounce or handle search input changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = () => {
    if (!pagination) return null;

    const { currentPage: current, totalPages } = pagination;
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === current ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>);
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Patients</h2>
        <input
          type="text"
          placeholder="Search patients..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* TODO: Implement patient list display */}
      {/* Map through patients and display them */}
      {/* Each patient should be clickable and call onSelectPatient with patient.id */}
      <div className="patient-list">
        {loading ? (
          <div className="loading">Loading patients...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : patients && patients.length > 0 ? (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => onSelectPatient(patient.id)}
            >
              <h3 className="patient-name">{patient.name}</h3>
              <div className="patient-info">
                <p className="patient-info-item patient-id">ID: <span className="value">{patient.id}</span></p>
                <p className="patient-info-item">Age: {calculateAge(patient.dateOfBirth)}</p>
                <p className="patient-info-item">Gender: {patient.gender}</p>
                <p className="patient-info-item">email: {patient.email}</p>
                <p className="patient-info-item">Phone: {patient.phone}</p>
                <p className="patient-info-item patient-address">
                  Address: {patient.address.split(', ').map((part, index, array) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && <>,<br /></>}
                    </span>
                  ))}
                </p>   
                <p className="patient-info-item">Member Since: {formatYear(patient.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="placeholder">
            <p>No patients found.</p>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn pagination-prev"
          >
            Previous
          </button>

          {renderPageNumbers()}

          <div className="pagination-info">
            Page {currentPage} of {pagination.totalPages} <em>({pagination.total} patients)</em>
          </div>
          

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="pagination-btn pagination-next"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientList;
