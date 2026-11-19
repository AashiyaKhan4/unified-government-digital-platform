const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('samanvay_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async demoLogin(role) {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  // Profile
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile/me`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/profile/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Services
  async getServices() {
    const res = await fetch(`${API_BASE}/services`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getService(id) {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  // Consent
  async grantConsent(data) {
    const res = await fetch(`${API_BASE}/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getConsentHistory() {
    const res = await fetch(`${API_BASE}/consent/history`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async revokeConsent(id) {
    const res = await fetch(`${API_BASE}/consent/${id}/revoke`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  // Applications
  async submitApplication(data) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getApplications() {
    const res = await fetch(`${API_BASE}/applications`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getApplication(id) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async retryApplication(id) {
    const res = await fetch(`${API_BASE}/applications/${id}/retry`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  // Official / Admin
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async updateApplicationStatus(id, status, remarks) {
    const res = await fetch(`${API_BASE}/admin/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, remarks })
    });
    return res.json();
  },

  // Connectors
  async getConnectors() {
    const res = await fetch(`${API_BASE}/connectors`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async testConnector(id) {
    const res = await fetch(`${API_BASE}/connectors/${id}/test`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async updateConnector(id, data) {
    const res = await fetch(`${API_BASE}/connectors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async testManualIntegration(data) {
    const res = await fetch(`${API_BASE}/integration/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit?${query}`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  // Mock Portals Config
  async getMockPortalsConfig() {
    const res = await fetch('/mock-portals/config');
    return res.json();
  },

  async updateMockPortalConfig(portal, data) {
    const res = await fetch(`/mock-portals/config/${portal}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
