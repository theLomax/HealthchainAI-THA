const express = require('express');
const router = express.Router();

// Import controllers
const patientsController = require('../controllers/patientsController');
const recordsController = require('../controllers/recordsController');
const consentsController = require('../controllers/consentsController');
const transactionsController = require('../controllers/transactionsController');
const healthController = require('../controllers/healthController');

// Health routes
router.get('/health', healthController.healthCheck);
router.get('/health/stats', healthController.getStats);
router.get('/health/stats/history', healthController.getStatsHistory);

// Patient routes
router.get('/patients', patientsController.getPatients);
router.get('/patients/:id', patientsController.getPatientById);
router.get('/patients/:id/records', recordsController.getPatientRecords);

// Records routes
router.get('/records', recordsController.getAllRecords);

// Consent routes
router.get('/consents', consentsController.getConsents);
router.get('/consents/:id', consentsController.getConsentById);
router.post('/consents', consentsController.createConsent);
router.patch('/consents/:id', consentsController.updateConsent);

// Transaction routes
router.get('/transactions', transactionsController.getTransactions);
router.post('/verify-signature', transactionsController.verifySignature);

module.exports = router;


