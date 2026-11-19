const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const ProfileController = require('../controllers/profileController');
const ServiceController = require('../controllers/serviceController');
const ConsentController = require('../controllers/consentController');
const ApplicationController = require('../controllers/applicationController');
const ConnectorController = require('../controllers/connectorController');
const AdminController = require('../controllers/adminController');
const AuditController = require('../controllers/auditController');
const NotificationController = require('../controllers/notificationController');

const { authenticate, requireRole } = require('../middleware/auth');

// Auth Endpoints (UC-01)
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/demo-login', AuthController.demoLogin);
router.get('/auth/me', authenticate, AuthController.me);

// Unified Profile Endpoints (UC-02)
router.get('/profile/me', authenticate, ProfileController.getProfile);
router.put('/profile/me', authenticate, ProfileController.updateProfile);

// Service Catalogue
router.get('/services', authenticate, ServiceController.listServices);
router.get('/services/:id', authenticate, ServiceController.getServiceById);

// Consent Management (UC-03)
router.post('/consent', authenticate, ConsentController.grantConsent);
router.get('/consent/history', authenticate, ConsentController.getHistory);
router.post('/consent/:id/revoke', authenticate, ConsentController.revokeConsent);

// Application Submission & Unified Tracking (UC-04, UC-05)
router.post('/applications', authenticate, ApplicationController.submitApplication);
router.get('/applications', authenticate, ApplicationController.listApplications);
router.get('/applications/:id', authenticate, ApplicationController.getApplicationById);
router.post('/applications/:id/retry', authenticate, ApplicationController.retryVerification);

// Connector Management (UC-07)
router.get('/connectors', authenticate, ConnectorController.listConnectors);
router.put('/connectors/:id', authenticate, requireRole('admin'), ConnectorController.updateConnector);
router.post('/connectors/:id/test', authenticate, ConnectorController.testConnector);
router.post('/integration/request', authenticate, ConnectorController.triggerManualRequest);

// Official & Admin Monitoring / Analytics (UC-06)
router.get('/admin/analytics', authenticate, requireRole('official', 'admin'), AdminController.getAnalytics);
router.put('/admin/applications/:id/status', authenticate, requireRole('official', 'admin'), AdminController.updateApplicationStatus);

// Audit Logs (UC-06)
router.get('/audit', authenticate, requireRole('official', 'admin'), AuditController.getAuditLogs);

// In-App Notifications
router.get('/notifications', authenticate, NotificationController.getNotifications);
router.put('/notifications/:id/read', authenticate, NotificationController.markAsRead);
router.put('/notifications/read-all', authenticate, NotificationController.markAllAsRead);

module.exports = router;
