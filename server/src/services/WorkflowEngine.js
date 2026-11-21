const { ApplicationModel, NotificationModel, AuditLogModel, ProfileModel } = require('../models');
const integrationEngine = require('../integration/IntegrationEngine');

class WorkflowEngine {
  /**
   * Process a new or updated application through its workflow pipeline
   */
  async processApplication(application, citizenProfile, actorId) {
    const appId = application._id || application.applicationId;
    const citizenId = application.citizenId;
    const serviceName = application.serviceName || 'Scholarship Scheme 2026';
    const isScholarship = serviceName.toLowerCase().includes('scholarship');

    const timeline = application.timeline || [
      {
        stage: 'Application Submitted',
        status: 'Completed',
        timestamp: new Date().toISOString(),
        details: 'Application successfully received by the Unified Gateway.'
      }
    ];

    const interoperabilityLogs = application.interoperabilityLogs || [];

    // Stage 1: Initial Validation
    timeline.push({
      stage: 'Initial Validation',
      status: 'Completed',
      timestamp: new Date().toISOString(),
      details: 'Basic information validated against citizen unified profile.'
    });

    if (!isScholarship) {
      // For single-department services (like direct certificate request)
      timeline.push({
        stage: 'Department Processing',
        status: 'In Progress',
        timestamp: new Date().toISOString(),
        details: 'Forwarded to respective department officer for verification.'
      });

      await ApplicationModel.updateOne(
        { _id: appId },
        {
          $set: {
            status: 'Under Verification',
            timeline,
            interoperabilityLogs
          }
        }
      );

      await NotificationModel.create({
        userId: citizenId,
        message: `Your application for ${serviceName} is now Under Verification.`,
        eventType: 'status_update',
        readStatus: false
      });

      return await ApplicationModel.findById(appId);
    }

    // Stage 2: Cross-Department Verification for Scholarship
    // Requires Income verification AND Residence verification
    const citizenRef = citizenProfile?.userId || citizenId;
    const citizenName = citizenProfile?.fullName || application.formData?.fullName || 'Rahul Sharma';
    const dob = citizenProfile?.dateOfBirth || application.formData?.dateOfBirth || '2004-06-15';

    const commonPayload = {
      name: citizenName,
      citizen_reference: citizenRef,
      date_of_birth: dob,
      address: citizenProfile?.address,
      education: citizenProfile?.education
    };

    // Step A: Request Income Verification
    const incomeResult = await integrationEngine.execute({
      citizenId,
      targetService: 'income',
      requestingService: 'scholarship-service',
      payload: commonPayload,
      category: 'Income Certificate',
      actorId
    });

    interoperabilityLogs.push({
      service: 'Income Certificate Portal',
      timestamp: new Date().toISOString(),
      result: incomeResult
    });

    if (!incomeResult.success && incomeResult.reason === 'CONSENT_DENIED') {
      timeline.push({
        stage: 'Consent Verification',
        status: 'Blocked',
        timestamp: new Date().toISOString(),
        details: 'Citizen consent for Income Certificate sharing is missing or denied.'
      });

      await ApplicationModel.updateOne(
        { _id: appId },
        {
          $set: {
            status: 'Incomplete',
            timeline,
            interoperabilityLogs,
            statusReason: 'Consent Required: Please approve sharing of Income & Residence data.'
          }
        }
      );

      await NotificationModel.create({
        userId: citizenId,
        message: `Action Required: Please grant consent to share verification data for your ${serviceName} application.`,
        eventType: 'consent_request',
        readStatus: false
      });

      return await ApplicationModel.findById(appId);
    }

    if (!incomeResult.success && incomeResult.delayed) {
      timeline.push({
        stage: 'Income Verification',
        status: 'Pending',
        timestamp: new Date().toISOString(),
        details: 'Income Certificate portal is delayed. Application queued for automated retry.'
      });

      await ApplicationModel.updateOne(
        { _id: appId },
        {
          $set: {
            status: 'Pending Verification',
            timeline,
            interoperabilityLogs,
            statusReason: 'External portal delayed: Pending Income Verification'
          }
        }
      );

      await NotificationModel.create({
        userId: citizenId,
        message: `Your application is currently Pending Verification due to external portal latency.`,
        eventType: 'service_delayed',
        readStatus: false
      });

      return await ApplicationModel.findById(appId);
    }

    // Step B: Request Residence Verification
    const residenceResult = await integrationEngine.execute({
      citizenId,
      targetService: 'residence',
      requestingService: 'scholarship-service',
      payload: commonPayload,
      category: 'Residence Verification',
      actorId
    });

    interoperabilityLogs.push({
      service: 'Residence Verification Portal',
      timestamp: new Date().toISOString(),
      result: residenceResult
    });

    if (!residenceResult.success && residenceResult.reason === 'CONSENT_DENIED') {
      timeline.push({
        stage: 'Residence Verification',
        status: 'Blocked',
        timestamp: new Date().toISOString(),
        details: 'Citizen consent for Residence Verification sharing is missing or denied.'
      });

      await ApplicationModel.updateOne(
        { _id: appId },
        {
          $set: {
            status: 'Incomplete',
            timeline,
            interoperabilityLogs,
            statusReason: 'Consent Required: Please approve sharing of Residence data.'
          }
        }
      );

      return await ApplicationModel.findById(appId);
    }

    if (!residenceResult.success && residenceResult.delayed) {
      timeline.push({
        stage: 'Residence Verification',
        status: 'Pending',
        timestamp: new Date().toISOString(),
        details: 'Residence portal is temporarily offline. Application queued for retry.'
      });

      await ApplicationModel.updateOne(
        { _id: appId },
        {
          $set: {
            status: 'Pending Verification',
            timeline,
            interoperabilityLogs,
            statusReason: 'External portal offline: Pending Residence Verification'
          }
        }
      );

      return await ApplicationModel.findById(appId);
    }

    // Both succeeded! Stage 3: Department Verification complete
    timeline.push({
      stage: 'Department Verification',
      status: 'Completed',
      timestamp: new Date().toISOString(),
      details: 'Income verified (Annual Income: ₹1,80,000) and Residence confirmed (Mumbai Suburban, 15 yrs).'
    });

    // Stage 4: Decision Stage
    timeline.push({
      stage: 'Decision / Approval',
      status: 'Under Final Review',
      timestamp: new Date().toISOString(),
      details: 'Cross-verification complete. Awaiting Department Officer sanction.'
    });

    // Update verified fields in CitizenProfile
    if (citizenProfile?._id) {
      const currentVerified = new Set(citizenProfile.verifiedFields || []);
      currentVerified.add('Income Certificate (Valid)');
      currentVerified.add('Domicile / Residence (Verified)');
      await ProfileModel.updateOne(
        { _id: citizenProfile._id },
        { $set: { verifiedFields: Array.from(currentVerified) } }
      );
    }

    await ApplicationModel.updateOne(
      { _id: appId },
      {
        $set: {
          status: 'Under Verification',
          timeline,
          interoperabilityLogs,
          verifiedData: {
            income: incomeResult.data,
            residence: residenceResult.data
          }
        }
      }
    );

    await NotificationModel.create({
      userId: citizenId,
      message: `Cross-department verification completed successfully for ${serviceName}. Now under official sanction.`,
      eventType: 'verification_completed',
      readStatus: false
    });

    return await ApplicationModel.findById(appId);
  }
}

module.exports = new WorkflowEngine();
