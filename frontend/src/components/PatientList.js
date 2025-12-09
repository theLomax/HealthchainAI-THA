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

      {/* TODO: Implement pagination controls */}
      {/* Show pagination buttons if pagination data is available */}
      {pagination && (
        <div className="pagination">
          {/* Your pagination implementation here */}
        </div>
      )}
    </div>
  );
};

export default PatientList;
