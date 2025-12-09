import React, { useState, useEffect } from 'react';
import './PatientDetail.css';
import { apiService } from '../services/apiService';
import { calculateAge, formatYear } from '../utils/dateUtils';

const PatientDetail = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient data and records
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch patient data and records in parallel
        const [patientData, recordsData] = await Promise.all([
          apiService.getPatient(patientId),
          apiService.getPatientRecords(patientId)
        ]);

        setPatient(patientData);
        setRecords(recordsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="patient-detail-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-container">
        <div className="error">Error loading patient: {error || 'Patient not found'}</div>
        <button onClick={onBack} className="back-btn">Back to List</button>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <button onClick={onBack} className="back-btn">← Back to List</button>
      </div>

      <div className="patient-detail-content">
        {/* TODO: Display patient information */}
        {/* Show: name, email, dateOfBirth, gender, phone, address, walletAddress */}
        <div className="patient-info-section">
          <h2>Patient Information</h2>
          <h3 className='patient-name'>{patient.name}</h3>
          <div className='patient-info-grid'>
            <p className="patient-id"><span className="info-label">ID:</span> <span className="info-value">{patient.id}</span></p>
            <p className="patient-info-item"><span className="info-label">Age:</span> <span className="info-value">{calculateAge(patient.dateOfBirth)}</span></p>
            <p className="patient-info-item"><span className="info-label">Gender:</span> <span className="info-value">{patient.gender}</span></p>
            <p className="patient-info-item"><span className="info-label">email:</span> <span className="info-value">{patient.email}</span></p>
            <p className="patient-info-item"><span className="info-label">Phone:</span> <span className="info-value">{patient.phone}</span></p>
            <p className="patient-info-item patient-address">
            <span className="info-label">Address:</span> <span className="info-value">{patient.address}</span>
            </p>
            <p className="patient-info-item"><span className="info-label">Patient Since:</span> <span className="info-value">{formatYear(patient.createdAt)}</span></p>
            <p className="patient-info-item"><span className="info-label">Wallet:</span> <span className='info-value wallet'>{patient.walletAddress}</span></p>
            </div>
        </div>

        {/* TODO: Display patient records */}
        {/* Show list of medical records with: type, title, date, doctor, hospital, status */}
        <div className="patient-records-section">
          <h2>Medical Records ({records.length})</h2>
          <div className="patient-records-list">
          </div>
        </div>
      </div>
    </div >
  );
};

export default PatientDetail;


