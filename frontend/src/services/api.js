const candidateBaseUrls = [
  import.meta.env.VITE_API_URL,
  'http://localhost:5000/api',
  'http://localhost:5001/api',
  'http://localhost:5002/api'
].filter(Boolean);

let activeBaseIndex = 0;

async function executeFetch(endpoint, options) {
  let lastError = null;
  for (let i = 0; i < candidateBaseUrls.length; i++) {
    const targetIdx = (activeBaseIndex + i) % candidateBaseUrls.length;
    const base = candidateBaseUrls[targetIdx];
    try {
      const res = await fetch(`${base}${endpoint}`, options);
      activeBaseIndex = targetIdx;
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export const api = {
  getToken() {
    return localStorage.getItem('procureai_token');
  },

  setAuth(data) {
    if (data.accessToken) localStorage.setItem('procureai_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('procureai_refresh', data.refreshToken);
    if (data.user) localStorage.setItem('procureai_user', JSON.stringify(data.user));
    if (data.organization) localStorage.setItem('procureai_org', JSON.stringify(data.organization));
  },

  clearAuth() {
    localStorage.removeItem('procureai_token');
    localStorage.removeItem('procureai_refresh');
    localStorage.removeItem('procureai_user');
    localStorage.removeItem('procureai_org');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    try {
      const response = await executeFetch(endpoint, {
        ...options,
        headers
      });

      // Special handling for binary blob responses like PDF downloads
      if (options.isBlob) {
        if (!response.ok) throw new Error('Failed to download document');
        return await response.blob();
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Auth endpoints
  login(credentials) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  },

  register(payload) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },

  getMe() {
    return this.request('/auth/me');
  },

  // Procurement endpoints
  getOrganization() {
    return this.request('/organizations/current');
  },

  updateScoringWeights(weights) {
    return this.request('/organizations/weights', { method: 'PATCH', body: JSON.stringify({ weights }) });
  },

  getSuppliers(query = '') {
    return this.request(`/suppliers${query ? `?${query}` : ''}`);
  },

  getSupplier(id) {
    return this.request(`/suppliers/${id}`);
  },

  createSupplier(data) {
    return this.request('/suppliers', { method: 'POST', body: JSON.stringify(data) });
  },

  getProducts() {
    return this.request('/products');
  },

  createProduct(data) {
    return this.request('/products', { method: 'POST', body: JSON.stringify(data) });
  },

  getCategories() {
    return this.request('/categories');
  },

  getRequirements() {
    return this.request('/purchase-requirements');
  },

  createRequirement(data) {
    return this.request('/purchase-requirements', { method: 'POST', body: JSON.stringify(data) });
  },

  updateRequirementStatus(id, payload) {
    return this.request(`/purchase-requirements/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) });
  },

  getRFQs(query = '') {
    return this.request(`/rfqs${query ? `?${query}` : ''}`);
  },

  getRFQ(id) {
    return this.request(`/rfqs/${id}`);
  },

  createRFQ(data) {
    return this.request('/rfqs', { method: 'POST', body: JSON.stringify(data) });
  },

  getQuotations(query = '') {
    return this.request(`/quotations${query ? `?${query}` : ''}`);
  },

  submitQuotation(data) {
    return this.request('/quotations', { method: 'POST', body: JSON.stringify(data) });
  },

  getQuotationAnalysis(rfqId) {
    return this.request(`/quotations/compare/${rfqId}`);
  },

  awardQuotation(id) {
    return this.request(`/quotations/${id}/award`, { method: 'POST' });
  },

  getPurchaseOrders(query = '') {
    return this.request(`/purchase-orders${query ? `?${query}` : ''}`);
  },

  getPO(id) {
    return this.request(`/purchase-orders/${id}`);
  },

  createPOFromQuotation(quotation_id) {
    return this.request('/purchase-orders/create-from-quotation', { method: 'POST', body: JSON.stringify({ quotation_id }) });
  },

  acknowledgePO(id) {
    return this.request(`/purchase-orders/${id}/acknowledge`, { method: 'POST' });
  },

  downloadPOPDF(id) {
    return this.request(`/purchase-orders/${id}/pdf`, { isBlob: true });
  },

  getShipments(query = '') {
    return this.request(`/shipments${query ? `?${query}` : ''}`);
  },

  createShipment(data) {
    return this.request('/shipments', { method: 'POST', body: JSON.stringify(data) });
  },

  updateShipmentLocation(id, data) {
    return this.request(`/shipments/${id}/location`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  getDeliveries(query = '') {
    return this.request(`/deliveries${query ? `?${query}` : ''}`);
  },

  createGoodsReceipt(data) {
    return this.request('/deliveries', { method: 'POST', body: JSON.stringify(data) });
  },

  getInvoices(query = '') {
    return this.request(`/invoices${query ? `?${query}` : ''}`);
  },

  getInvoice(id) {
    return this.request(`/invoices/${id}`);
  },

  uploadInvoice(data) {
    return this.request('/invoices', { method: 'POST', body: JSON.stringify(data) });
  },

  approveInvoice(id) {
    return this.request(`/invoices/${id}/approve`, { method: 'POST' });
  },

  getDocuments() {
    return this.request('/documents');
  },

  uploadDocument(data) {
    return this.request('/documents', { method: 'POST', body: JSON.stringify(data) });
  },

  downloadDocument(id) {
    return this.request(`/documents/${id}/download`, { isBlob: true });
  },

  getAnalytics() {
    return this.request('/analytics');
  },

  getAnomalies() {
    return this.request('/anomalies');
  },

  getAIInsights() {
    return this.request('/ai/insights');
  },

  getNotifications() {
    return this.request('/notifications');
  },

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  },

  getAuditLogs() {
    return this.request('/audit-logs');
  }
};
