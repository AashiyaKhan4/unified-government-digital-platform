const { ConnectorModel, AuditLogModel } = require('../models');
const integrationEngine = require('../integration/IntegrationEngine');

class ConnectorController {
  static async listConnectors(req, res) {
    try {
      const connectors = await ConnectorModel.find({});
      res.json({ success: true, count: connectors.length, connectors });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async testConnector(req, res) {
    try {
      const { id } = req.params;
      const connectorDoc = await ConnectorModel.findById(id);
      if (!connectorDoc) {
        return res.status(404).json({ success: false, message: 'Connector not found' });
      }

      const connectorInstance = integrationEngine.getConnector(
        connectorDoc.name.toLowerCase().includes('scholarship') ? 'scholarship' :
        connectorDoc.name.toLowerCase().includes('certificate') || connectorDoc.name.toLowerCase().includes('income') ? 'income' : 'residence'
      );

      const healthResult = await connectorInstance.checkHealth();

      await ConnectorModel.updateOne(
        { _id: id },
        {
          $set: {
            connectionStatus: healthResult.healthy ? 'Connected' : 'Unavailable',
            lastTested: new Date().toISOString()
          }
        }
      );

      await AuditLogModel.create({
        actor: req.user.userId,
        action: 'CONNECTOR_PING_TEST',
        resource: connectorDoc.endpoint,
        outcome: healthResult.healthy ? 'Success' : 'Failure',
        timestamp: new Date().toISOString(),
        details: healthResult
      });

      res.json({
        success: true,
        connector: connectorDoc.name,
        health: healthResult
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateConnector(req, res) {
    try {
      const { id } = req.params;
      const { endpoint, mappingRules, connectionStatus } = req.body;

      const updateData = {};
      if (endpoint) updateData.endpoint = endpoint;
      if (mappingRules) updateData.mappingRules = mappingRules;
      if (connectionStatus) updateData.connectionStatus = connectionStatus;

      await ConnectorModel.updateOne({ _id: id }, { $set: updateData });

      await AuditLogModel.create({
        actor: req.user.userId,
        action: 'CONNECTOR_CONFIG_UPDATED',
        resource: `/connectors/${id}`,
        outcome: 'Success',
        timestamp: new Date().toISOString(),
        details: updateData
      });

      const updated = await ConnectorModel.findById(id);
      res.json({ success: true, message: 'Connector configuration updated.', connector: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async triggerManualRequest(req, res) {
    try {
      const { targetService, payload, category, requestingService } = req.body;
      const result = await integrationEngine.execute({
        citizenId: req.user.userId,
        targetService: targetService || 'income',
        requestingService: requestingService || 'Scholarship Department',
        payload: payload || { name: 'Rahul Sharma', citizen_reference: 'CIT-1024', date_of_birth: '2004-06-15' },
        category: category || 'Income Certificate',
        actorId: req.user.userId
      });

      res.json({
        success: result.success,
        data: result
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = ConnectorController;
