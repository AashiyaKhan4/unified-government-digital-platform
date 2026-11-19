const { AuditLogModel } = require('../models');
const crypto = require('crypto');

class AuditService {
  /**
   * Record an immutable audit log entry
   * SDS Data Dictionary: logId, actor, action, resource, timestamp, outcome, details
   */
  static async record({ actor, action, resource, outcome = 'Success', details = {}, correlationId }) {
    const cid = correlationId || 'AUDIT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    return await AuditLogModel.create({
      actor: actor || 'ANONYMOUS',
      action,
      resource,
      outcome,
      correlationId: cid,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static async getLogs(filter = {}, options = {}) {
    return await AuditLogModel.find(filter, {
      sort: { timestamp: -1 },
      limit: options.limit || 100,
      skip: options.skip || 0
    });
  }
}

module.exports = AuditService;
