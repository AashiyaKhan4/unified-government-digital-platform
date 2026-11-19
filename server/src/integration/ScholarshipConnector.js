const BaseConnector = require('./BaseConnector');
const DataMapper = require('./DataMapper');

class ScholarshipConnector extends BaseConnector {
  constructor(config = {}) {
    super({
      name: 'ScholarshipConnector',
      endpoint: config.endpoint || 'http://localhost:5000/mock-portals/scholarship',
      mappingRules: {
        'name': 'student_name',
        'citizen_reference': 'student_id',
        'date_of_birth': 'birth_date'
      },
      connectionStatus: config.connectionStatus || 'Connected',
      maxRetries: 3,
      retryDelayMs: 400
    });
    this.key = 'student_name';
    this.baseUrl = this.endpoint;
  }

  toTarget(commonData) {
    return DataMapper.toTarget('scholarship', commonData);
  }

  toCommon(portalData) {
    return DataMapper.toCommon('scholarship', portalData);
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      this.connectionStatus = data.status || 'Connected';
      return { healthy: true, status: this.connectionStatus, latency: data.latency || '12ms' };
    } catch (err) {
      this.connectionStatus = 'Unavailable';
      return { healthy: false, status: 'Unavailable', error: err.message };
    }
  }

  async send(payload, operation = 'submit') {
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
        const err = new Error(`Scholarship Portal returned HTTP ${res.status}: ${errorText}`);
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

module.exports = ScholarshipConnector;
