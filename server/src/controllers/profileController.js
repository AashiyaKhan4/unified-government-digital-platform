const { ProfileModel, AuditLogModel } = require('../models');

class ProfileController {
  static async getProfile(req, res) {
    try {
      let profile = await ProfileModel.findOne({ userId: req.user.userId });
      if (!profile) {
        // Create initial default profile if not present
        profile = await ProfileModel.create({
          userId: req.user.userId,
          fullName: req.user.name,
          dateOfBirth: '2004-06-15',
          address: 'Flat 402, Green Park, Andheri East, Mumbai, Maharashtra - 400069',
          contact: {
            phone: '+91 98201 12345',
            email: req.user.email
          },
          education: {
            course: 'B.Tech in Computer Science & Engineering',
            institution: 'Government College of Engineering, Mumbai',
            year: 2026,
            score: 88.5
          },
          verifiedFields: ['Unified Identity (Verified)']
        });
      }
      res.json({ success: true, profile });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { fullName, dateOfBirth, address, contact, education } = req.body;
      
      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
      if (address) updateData.address = address;
      if (contact) updateData.contact = contact;
      if (education) updateData.education = education;

      await ProfileModel.updateOne(
        { userId: req.user.userId },
        { $set: updateData }
      );

      await AuditLogModel.create({
        actor: req.user.userId,
        action: 'PROFILE_UPDATED',
        resource: `/profile/${req.user.userId}`,
        outcome: 'Success',
        timestamp: new Date().toISOString(),
        details: { updatedFields: Object.keys(updateData) }
      });

      const updated = await ProfileModel.findOne({ userId: req.user.userId });
      res.json({ success: true, message: 'Unified Profile updated successfully.', profile: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = ProfileController;
