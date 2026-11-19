const { db } = require('../db/DocumentStore');

const UserModel = {
  find: (query, opt) => db.getCollection('Users').find(query, opt),
  findOne: (query) => db.getCollection('Users').findOne(query),
  findById: (id) => db.getCollection('Users').findById(id),
  create: (doc) => db.getCollection('Users').insertOne(doc),
  updateOne: (query, update) => db.getCollection('Users').updateOne(query, update),
  count: (query) => db.getCollection('Users').countDocuments(query)
};

const ProfileModel = {
  find: (query, opt) => db.getCollection('CitizenProfiles').find(query, opt),
  findOne: (query) => db.getCollection('CitizenProfiles').findOne(query),
  findById: (id) => db.getCollection('CitizenProfiles').findById(id),
  create: (doc) => db.getCollection('CitizenProfiles').insertOne(doc),
  updateOne: (query, update) => db.getCollection('CitizenProfiles').updateOne(query, update),
  count: (query) => db.getCollection('CitizenProfiles').countDocuments(query)
};

const ServiceModel = {
  find: (query, opt) => db.getCollection('Services').find(query, opt),
  findOne: (query) => db.getCollection('Services').findOne(query),
  findById: (id) => db.getCollection('Services').findById(id),
  create: (doc) => db.getCollection('Services').insertOne(doc),
  updateOne: (query, update) => db.getCollection('Services').updateOne(query, update),
  count: (query) => db.getCollection('Services').countDocuments(query)
};

const ApplicationModel = {
  find: (query, opt) => db.getCollection('Applications').find(query, opt),
  findOne: (query) => db.getCollection('Applications').findOne(query),
  findById: (id) => db.getCollection('Applications').findById(id),
  create: (doc) => db.getCollection('Applications').insertOne(doc),
  updateOne: (query, update) => db.getCollection('Applications').updateOne(query, update),
  count: (query) => db.getCollection('Applications').countDocuments(query)
};

const ConsentModel = {
  find: (query, opt) => db.getCollection('Consents').find(query, opt),
  findOne: (query) => db.getCollection('Consents').findOne(query),
  findById: (id) => db.getCollection('Consents').findById(id),
  create: (doc) => db.getCollection('Consents').insertOne(doc),
  updateOne: (query, update) => db.getCollection('Consents').updateOne(query, update),
  count: (query) => db.getCollection('Consents').countDocuments(query)
};

const ConnectorModel = {
  find: (query, opt) => db.getCollection('Connectors').find(query, opt),
  findOne: (query) => db.getCollection('Connectors').findOne(query),
  findById: (id) => db.getCollection('Connectors').findById(id),
  create: (doc) => db.getCollection('Connectors').insertOne(doc),
  updateOne: (query, update) => db.getCollection('Connectors').updateOne(query, update),
  count: (query) => db.getCollection('Connectors').countDocuments(query)
};

const AuditLogModel = {
  find: (query, opt) => db.getCollection('AuditLogs').find(query, opt),
  findOne: (query) => db.getCollection('AuditLogs').findOne(query),
  findById: (id) => db.getCollection('AuditLogs').findById(id),
  create: (doc) => db.getCollection('AuditLogs').insertOne(doc),
  count: (query) => db.getCollection('AuditLogs').countDocuments(query)
};

const NotificationModel = {
  find: (query, opt) => db.getCollection('Notifications').find(query, opt),
  findOne: (query) => db.getCollection('Notifications').findOne(query),
  findById: (id) => db.getCollection('Notifications').findById(id),
  create: (doc) => db.getCollection('Notifications').insertOne(doc),
  updateOne: (query, update) => db.getCollection('Notifications').updateOne(query, update),
  count: (query) => db.getCollection('Notifications').countDocuments(query)
};

module.exports = {
  UserModel,
  ProfileModel,
  ServiceModel,
  ApplicationModel,
  ConsentModel,
  ConnectorModel,
  AuditLogModel,
  NotificationModel
};
