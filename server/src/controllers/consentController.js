const ConsentService = require('../services/ConsentService');
const { ConsentModel } = require('../models');

class ConsentController {
  static async grantConsent(req, res) {
    try {
      const { requestingServiceId, categories, purpose, expiryDays } = req.body;
      if (!categories || categories.length === 0) {
        return res.status(400).json({ success: false, message: 'Data categories are required for consent.' });
      }

      const consent = await ConsentService.grantConsent({
        citizenId: req.user.userId,
        requestingServiceId: requestingServiceId || 'Scholarship Department',
        categories,
        purpose: purpose || 'Verification for government digital service application',
        expiryDays: expiryDays || 90
      });

      res.status(201).json({
        success: true,
        message: 'Consent granted successfully.',
        consent
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getHistory(req, res) {
    try {
      const consents = await ConsentService.getCitizenConsents(req.user.userId);
      res.json({ success: true, count: consents.length, consents });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async revokeConsent(req, res) {
    try {
      const { id } = req.params;
      const revoked = await ConsentService.revokeConsent(id, req.user.userId);
      res.json({
        success: true,
        message: 'Consent has been revoked successfully. Future inter-service data sharing stopped.',
        consent: revoked
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = ConsentController;
