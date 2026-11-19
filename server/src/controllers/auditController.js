const AuditService = require('../services/AuditService');

class AuditController {
  static async getAuditLogs(req, res) {
    try {
      const { actor, action, outcome, limit, search } = req.query;
      let query = {};
      if (actor) query.actor = actor;
      if (action) query.action = { $regex: action, $options: 'i' };
      if (outcome) query.outcome = outcome;
      if (search) query.action = { $regex: search, $options: 'i' };

      const logs = await AuditService.getLogs(query, { limit: limit ? parseInt(limit) : 100 });
      res.json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = AuditController;
