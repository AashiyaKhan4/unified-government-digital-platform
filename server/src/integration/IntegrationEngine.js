const { ConsentModel, AuditLogModel, ConnectorModel } = require('../models');
const ScholarshipConnector = require('./ScholarshipConnector');
const CertificateConnector = require('./CertificateConnector');
const ResidenceConnector = require('./ResidenceConnector');
const crypto = require('crypto');

class IntegrationEngine {
  constructor() {
    this.connectors = {
      scholarship: new ScholarshipConnector(),
      income: new CertificateConnector(),
      certificate: new CertificateConnector(),
      residence: new ResidenceConnector(),
      domicile: new ResidenceConnector()
    };
  }

  getConnector(serviceKey) {
    const key = serviceKey.toLowerCase();
    const connector = this.connectors[key];
    if (!connector) {
      throw new Error(`No connector registered for service: ${serviceKey}`);
    }
    return connector;
  }

  /**
   * Verify whether active citizen consent exists for this data exchange
   * SDS Sequence Diagram: Step 2 & 3: verify consent
   */
  async verifyConsent(citizenId, requestingServiceId, category) {
    const now = new Date();
    const consents = await ConsentModel.find({
      citizenId,
      status: 'Approved'
    });

    const validConsent = consents.find(c => {
      // Check expiry
      if (c.expiry && new Date(c.expiry) < now) return false;
      // Check category match if provided
      if (category && c.categories && !c.categories.includes(category)) return false;
      // Check requesting service if specified
      if (requestingServiceId && c.requestingServiceId && c.requestingServiceId !== requestingServiceId) return false;
      return true;
    });

    return !!validConsent;
  }

  /**
   * Execute cross-portal verification or data fetch
   * Sequence: Citizen App -> API Gateway -> Verify Consent -> Integration Engine -> DataMapper -> Connector -> Mock Portal -> Normalization -> AuditLog
   */
  async execute({ citizenId, targetService, requestingService, payload, category, actorId }) {
    const correlationId = 'CORR-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const timestamp = new Date().toISOString();

    // 1. Consent Gate Check
    const hasConsent = await this.verifyConsent(citizenId, requestingService, category);
    if (!hasConsent) {
      // Record audit log of denied access attempt
      await AuditLogModel.create({
        actor: actorId || citizenId || 'SYSTEM_WORKFLOW',
        action: `INTEROP_REQUEST_${targetService.toUpperCase()}`,
        resource: `/mock-portals/${targetService}`,
        outcome: 'Failure',
        correlationId,
        timestamp,
        details: {
          error: 'Consent verification failed. Required consent is missing, denied, or expired.',
          category,
          requestingService
        }
      });

      return {
        success: false,
        consentGranted: false,
        reason: 'CONSENT_DENIED',
        message: `Data sharing blocked: Citizen has not granted active consent for ${category || targetService}.`,
        correlationId
      };
    }

    // 2. Fetch appropriate polymorphic connector
    let connector;
    try {
      connector = this.getConnector(targetService);
    } catch (err) {
      await AuditLogModel.create({
        actor: actorId || citizenId || 'SYSTEM_WORKFLOW',
        action: `CONNECTOR_RESOLVE_FAILED`,
        resource: targetService,
        outcome: 'Failure',
        correlationId,
        timestamp,
        details: { error: err.message }
      });
      return { success: false, reason: 'CONNECTOR_NOT_FOUND', message: err.message, correlationId };
    }

    // 3. Execute Connector with mapping, retries and resilience
    try {
      const result = await connector.send(payload, 'verify');

      // 4. Log Success in Audit Trail
      await AuditLogModel.create({
        actor: actorId || citizenId || 'SYSTEM_WORKFLOW',
        action: `INTEROP_VERIFY_${targetService.toUpperCase()}`,
        resource: connector.endpoint,
        outcome: 'Success',
        correlationId,
        timestamp,
        details: {
          requestKey: connector.key,
          targetService,
          rawRequest: result.rawRequest,
          rawResponse: result.rawResponse,
          normalized: result.normalizedResponse
        }
      });

      // Update connector status in DB
      await ConnectorModel.updateOne(
        { name: connector.name },
        { $set: { connectionStatus: 'Connected', lastTested: timestamp } }
      );

      return {
        success: true,
        consentGranted: true,
        connectorName: connector.name,
        correlationId,
        rawRequest: result.rawRequest,
        rawResponse: result.rawResponse,
        data: result.normalizedResponse
      };
    } catch (err) {
      // 5. Fault Tolerance: mark Pending Verification instead of crashing
      console.error(`[IntegrationEngine] Execution error on ${targetService}:`, err.message);

      await AuditLogModel.create({
        actor: actorId || citizenId || 'SYSTEM_WORKFLOW',
        action: `INTEROP_VERIFY_${targetService.toUpperCase()}_FAIL`,
        resource: connector.endpoint,
        outcome: 'Failure',
        correlationId,
        timestamp,
        details: {
          error: err.message,
          retryCount: connector.maxRetries,
          statusCode: err.statusCode || 503
        }
      });

      // Update connector status to Delayed / Unavailable
      await ConnectorModel.updateOne(
        { name: connector.name },
        { $set: { connectionStatus: 'Unavailable', lastError: err.message, lastTested: timestamp } }
      );

      return {
        success: false,
        delayed: true,
        status: 'Pending Verification',
        reason: 'SERVICE_TEMPORARILY_UNAVAILABLE',
        message: `External portal ${targetService} is currently delayed or unreachable. Application placed in 'Pending Verification'.`,
        error: err.message,
        correlationId
      };
    }
  }

  /**
   * Health check all registered connectors
   */
  async checkAllConnectors() {
    const results = {};
    for (const [key, connector] of Object.entries(this.connectors)) {
      if (!results[connector.name]) {
        results[connector.name] = await connector.checkHealth();
      }
    }
    return results;
  }
}

const integrationEngine = new IntegrationEngine();

module.exports = integrationEngine;
