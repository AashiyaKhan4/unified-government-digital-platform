const { ServiceModel } = require('../models');

class ServiceController {
  static async listServices(req, res) {
    try {
      const services = await ServiceModel.find({});
      res.json({ success: true, count: services.length, services });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getServiceById(req, res) {
    try {
      const service = await ServiceModel.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }
      res.json({ success: true, service });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = ServiceController;
