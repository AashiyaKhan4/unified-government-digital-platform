const { ConsentModel, AuditLogModel, NotificationModel } = require('../models');

class ConsentService {
  static async grantConsent({ citizenId, requestingServiceId, categories, purpose, expiryDays = 90 }) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (expiryDays || 90));

    // Check if prior active consent exists
    const existing = await ConsentModel.findOne({
      citizenId,
      requestingServiceId,
      status: 'Approved'
    });

    let consent;
    if (existing) {
      consent = await ConsentModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            categories,
            purpose,
            expiry: expiry.toISOString(),
            status: 'Approved',
            updatedAt: new Date().toISOString()
          }
        }
      );
      consent = await ConsentModel.findById(existing._id);
    } else {
      consent = await ConsentModel.create({
        citizenId,
        requestingServiceId,
        categories: Array.isArray(categories) ? categories : [categories],
        purpose: purpose || 'Verification for government service delivery',
        status: 'Approved',
        expiry: expiry.toISOString()
      });
    }

    // Audit log
    await AuditLogModel.create({
      actor: citizenId,
      action: 'CONSENT_GRANTED',
      resource: `/consents/${consent._id}`,
      outcome: 'Success',
      timestamp: new Date().toISOString(),
      details: {
        requestingServiceId,
        categories,
        purpose,
        expiry: expiry.toISOString()
      }
    });

    // In-app notification
    await NotificationModel.create({
      userId: citizenId,
      message: `Consent granted for ${categories.join(', ')} to ${requestingServiceId}. Valid until ${expiry.toLocaleDateString()}.`,
      eventType: 'consent_granted',
      readStatus: false,
      timestamp: new Date().toISOString()
    });

    return consent;
  }

  static async revokeConsent(consentId, citizenId) {
    const consent = await ConsentModel.findById(consentId);
    if (!consent) {
      throw new Error('Consent record not found');
    }
    if (consent.citizenId !== citizenId) {
      throw new Error('Unauthorized to revoke this consent');
    }

    await ConsentModel.updateOne(
      { _id: consentId },
      { $set: { status: 'Revoked', revokedAt: new Date().toISOString() } }
    );

    await AuditLogModel.create({
      actor: citizenId,
      action: 'CONSENT_REVOKED',
      resource: `/consents/${consentId}`,
      outcome: 'Success',
      timestamp: new Date().toISOString(),
      details: {
        consentId,
        requestingServiceId: consent.requestingServiceId,
        categories: consent.categories
      }
    });

    await NotificationModel.create({
      userId: citizenId,
      message: `Consent revoked for ${consent.categories?.join(', ')}. Inter-service sharing stopped.`,
      eventType: 'consent_revoked',
      readStatus: false,
      timestamp: new Date().toISOString()
    });

    return await ConsentModel.findById(consentId);
  }

  static async getCitizenConsents(citizenId) {
    return await ConsentModel.find({ citizenId }, { sort: { createdAt: -1 } });
  }
}

module.exports = ConsentService;
