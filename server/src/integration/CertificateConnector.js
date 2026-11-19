const BaseConnector = require('./BaseConnector');
const DataMapper = require('./DataMapper');

class CertificateConnector extends BaseConnector {
  constructor(config = {}) {
    super({
      name: 'CertificateConnector',
      endpoint: config.endpoint || 'http://localhost:5000/mock-portals/income',
      mappingRules: {
        'name': 'applicant_name',
        'citizen_reference': 'applicant_number',
        'date_of_birth': 'dob'
      },
      connectionStatus: config.connectionStatus || 'Connected',
      maxRetries: 3,
      retryDelayMs: 400
    });
    this.key = 'applicant_name';
    this.baseUrl = this.endpoint;
  }

  toTarget(commonData) {
    return DataMapper.toTarget('income', commonData);
  }

  toCommon(portalData) {
    return DataMapper.toCommon('income', portalData);
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      this.connectionStatus = data.status || 'Connected';
      return { healthy: true, status: this.connectionStatus, latency: data.latency || '18ms' };
    } catch (err) {
      this.connectionStatus = 'Unavailable';
      return { healthy: false, status: 'Unavailable', error: err.message };
    }
  }

  async send(payload, operation = 'verify') {
    return await this.executeWithRetry(async () => {
      const targetPayload = this.toTarget(payload);
      const url = `${this.baseUrl}/${operation}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetPayload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        const err = new Error(`Income Portal returned HTTP ${res.status}: ${errorText}`);
        err.statusCode = res.status;
        throw err;
      }

      const portalResponse = await res.json();
      const normalized = this.toCommon(portalResponse);
      return {
        success: true,
        rawRequest: targetPayload,
        rawResponse: portalResponse,
        normalizedResponse: normalized
      };
    });
  }
}

module.exports = CertificateConnector;
