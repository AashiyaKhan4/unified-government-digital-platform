const express = require('express');
const router = express.Router();
const MockPortalController = require('../controllers/mockPortalController');

// Configuration
router.get('/config', MockPortalController.getPortalConfig);
router.post('/config/:portal', MockPortalController.updatePortalConfig);

// 1. Mock Scholarship Portal (Key: student_name, student_id, birth_date)
router.get('/scholarship/health', MockPortalController.scholarshipHealth);
router.post('/scholarship/submit', MockPortalController.scholarshipSubmit);
router.post('/scholarship/verify', MockPortalController.scholarshipVerify);

// 2. Mock Income Certificate Portal (Key: applicant_name, applicant_number, dob)
router.get('/income/health', MockPortalController.incomeHealth);
router.post('/income/verify', MockPortalController.incomeVerify);

// 3. Mock Residence Verification Portal (Key: fullName, resident_id, date_of_birth)
router.get('/residence/health', MockPortalController.residenceHealth);
router.post('/residence/verify', MockPortalController.residenceVerify);

module.exports = router;
