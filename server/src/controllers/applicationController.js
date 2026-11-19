const { ApplicationModel, ServiceModel, ProfileModel, AuditLogModel, NotificationModel } = require('../models');
const workflowEngine = require('../services/WorkflowEngine');
const ConsentService = require('../services/ConsentService');

class ApplicationController {
  static async submitApplication(req, res) {
    try {
      const { serviceId, formData, consentGranted, requestedCategories } = req.body;
      const citizenId = req.user.userId;

      const service = await ServiceModel.findById(serviceId);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Specified government service not found.' });
      }

      const profile = await ProfileModel.findOne({ userId: citizenId });

      // If user granted consent directly on submission screen
      if (consentGranted && requestedCategories && requestedCategories.length > 0) {
        await ConsentService.grantConsent({
          citizenId,
          requestingServiceId: service.name,
          categories: requestedCategories,
          purpose: `Inter-departmental verification for ${service.name}`
        });
      }

      // Generate application identifier
      const servicePrefix = service.name.toUpperCase().includes('SCHOLARSHIP') ? 'SCH' :
                            service.name.toUpperCase().includes('INCOME') ? 'INC' :
                            service.name.toUpperCase().includes('DOMICILE') || service.name.toUpperCase().includes('RESIDENCE') ? 'RES' : 'APP';
      const trackingCode = `${servicePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      const initialTimeline = [
        {
          stage: 'Application Submitted',
          status: 'Completed',
          timestamp: new Date().toISOString(),
          details: `Application submitted successfully via Samanvay Gateway. Tracking ID: ${trackingCode}`
        }
      ];

      const newApp = await ApplicationModel.create({
        applicationTrackingCode: trackingCode,
        citizenId,
        serviceId: service._id || service.serviceId,
        serviceName: service.name,
        department: service.department,
        status: 'Submitted',
        formData: formData || {},
        timeline: initialTimeline,
        submittedAt: new Date().toISOString(),
        interoperabilityLogs: []
      });

      await AuditLogModel.create({
        actor: citizenId,
        action: 'APPLICATION_SUBMITTED',
        resource: `/applications/${newApp._id}`,
        outcome: 'Success',
        timestamp: new Date().toISOString(),
        details: { trackingCode, serviceName: service.name }
      });

      await NotificationModel.create({
        userId: citizenId,
        message: `Your application ${trackingCode} for ${service.name} has been submitted.`,
        eventType: 'application_submitted',
        readStatus: false,
        timestamp: new Date().toISOString()
      });

      // Execute Workflow Orchestration (Checks consent -> Connectors -> Mapping -> Normalization)
      const processedApp = await workflowEngine.processApplication(newApp, profile, citizenId);

      res.status(201).json({
        success: true,
        message: 'Application submitted and routed through workflow orchestration.',
        application: processedApp
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async listApplications(req, res) {
    try {
      const user = req.user;
      let query = {};
      if (user.role === 'citizen') {
        query.citizenId = user.userId;
      }

      const applications = await ApplicationModel.find(query, { sort: { submittedAt: -1 } });
      res.json({ success: true, count: applications.length, applications });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getApplicationById(req, res) {
    try {
      const app = await ApplicationModel.findById(req.params.id);
      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found.' });
      }

      // Check permission
      if (req.user.role === 'citizen' && app.citizenId !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Access denied to this application.' });
      }

      res.json({ success: true, application: app });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async retryVerification(req, res) {
    try {
      const app = await ApplicationModel.findById(req.params.id);
      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found.' });
      }

      const profile = await ProfileModel.findOne({ userId: app.citizenId });
      const processed = await workflowEngine.processApplication(app, profile, req.user.userId);

      res.json({
        success: true,
        message: 'Verification retry executed.',
        application: processed
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = ApplicationController;
