const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generates MongoDB-compatible 24-character hex ID
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return timestamp + randomBytes;
}

class Collection {
  constructor(name, dataDir) {
    this.name = name;
    this.filePath = path.join(dataDir, `${name}.json`);
    this.items = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.items = JSON.parse(raw);
      } else {
        this.items = [];
        this.save();
      }
    } catch (err) {
      console.error(`Error loading collection ${this.name}:`, err);
      this.items = [];
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.items, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error saving collection ${this.name}:`, err);
    }
  }

  _matchesQuery(item, query) {
    if (!query || Object.keys(query).length === 0) return true;
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if ('$ne' in value && item[key] === value.$ne) return false;
        if ('$in' in value && !value.$in.includes(item[key])) return false;
        if ('$gt' in value && !(item[key] > value.$gt)) return false;
        if ('$gte' in value && !(item[key] >= value.$gte)) return false;
        if ('$lt' in value && !(item[key] < value.$lt)) return false;
        if ('$lte' in value && !(item[key] <= value.$lte)) return false;
        if ('$regex' in value) {
          const reg = new RegExp(value.$regex, value.$options || 'i');
          if (!reg.test(String(item[key] || ''))) return false;
        }
      } else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  }

  async find(query = {}, options = {}) {
    let result = this.items.filter(item => this._matchesQuery(item, query));
    if (options.sort) {
      const [field, direction] = Object.entries(options.sort)[0];
      const dir = direction === -1 || direction === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        if (a[field] < b[field]) return -1 * dir;
        if (a[field] > b[field]) return 1 * dir;
        return 0;
      });
    }
    if (options.skip) {
      result = result.slice(options.skip);
    }
    if (options.limit) {
      result = result.slice(0, options.limit);
    }
    return JSON.parse(JSON.stringify(result));
  }

  async findOne(query = {}) {
    const item = this.items.find(doc => this._matchesQuery(doc, query));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async findById(id) {
    const key = this.name.endsWith('s') ? this.name.slice(0, -1) + 'Id' : this.name + 'Id';
    const item = this.items.find(doc => doc._id === id || doc[key] === id || doc.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async insertOne(doc) {
    const key = this.name.endsWith('s') ? this.name.slice(0, -1) + 'Id' : this.name + 'Id';
    const _id = doc._id || generateObjectId();
    const newDoc = {
      _id,
      [key]: doc[key] || _id,
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.items.push(newDoc);
    this.save();
    return JSON.parse(JSON.stringify(newDoc));
  }

  async insertMany(docs) {
    const results = [];
    for (const doc of docs) {
      results.push(await this.insertOne(doc));
    }
    return results;
  }

  async updateOne(query, update) {
    const index = this.items.findIndex(doc => this._matchesQuery(doc, query));
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };
    
    let current = this.items[index];
    if (update.$set) {
      current = { ...current, ...update.$set, updatedAt: new Date().toISOString() };
    } else {
      current = { ...current, ...update, updatedAt: new Date().toISOString() };
    }
    this.items[index] = current;
    this.save();
    return { matchedCount: 1, modifiedCount: 1, document: JSON.parse(JSON.stringify(current)) };
  }

  async deleteOne(query) {
    const index = this.items.findIndex(doc => this._matchesQuery(doc, query));
    if (index === -1) return { deletedCount: 0 };
    this.items.splice(index, 1);
    this.save();
    return { deletedCount: 1 };
  }

  async countDocuments(query = {}) {
    return this.items.filter(doc => this._matchesQuery(doc, query)).length;
  }
}

class DocumentStore {
  constructor(dataDir = path.join(__dirname, '../../data')) {
    this.dataDir = dataDir;
    this.collections = {};
    const collectionNames = [
      'Users',
      'CitizenProfiles',
      'Services',
      'Applications',
      'Consents',
      'Connectors',
      'AuditLogs',
      'Notifications'
    ];
    for (const name of collectionNames) {
      this.collections[name] = new Collection(name, this.dataDir);
    }
  }

  getCollection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Collection(name, this.dataDir);
    }
    return this.collections[name];
  }
}

const db = new DocumentStore();

module.exports = {
  db,
  generateObjectId
};
