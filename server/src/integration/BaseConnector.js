/**
 * BaseConnector - Abstract Base Class for all external / mock government portal connectors
 * Implements encapsulation, polymorphism, retry policy and health checks as specified in SDS 2.5
 */
class BaseConnector {
  constructor({ name, endpoint, mappingRules = {}, connectionStatus = 'Connected', maxRetries = 3, retryDelayMs = 500 }) {
    if (this.constructor === BaseConnector) {
      throw new Error("BaseConnector is an abstract class and cannot be instantiated directly.");
    }
    this.name = name;
    this.endpoint = endpoint;
    this.mappingRules = mappingRules;
    this.connectionStatus = connectionStatus;
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
  }

  /**
   * Health check method to ping external / mock service
   */
  async checkHealth() {
    throw new Error("checkHealth() must be implemented by subclass.");
  }

  /**
   * Send payload to target system
   */
  async send(payload, operation = 'verify') {
    throw new Error("send() must be implemented by subclass.");
  }

  /**
   * Transform data to target portal format
   */
  toTarget(commonData) {
    throw new Error("toTarget() must be implemented by subclass.");
  }

  /**
   * Normalize target portal response to common format
   */
  toCommon(portalData) {
    throw new Error("toCommon() must be implemented by subclass.");
  }

  /**
   * Resilient execution with retry policy and backoff
   */
  async executeWithRetry(fn) {
    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        console.warn(`[${this.name}] Attempt ${attempt} failed: ${err.message}`);
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelayMs * Math.pow(2, attempt - 1)));
        }
      }
    }
    throw lastError;
  }
}

module.exports = BaseConnector;
