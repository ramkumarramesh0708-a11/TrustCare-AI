const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('aegis_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail);
  }
  return response.json();
}

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Modules
  getModules: async () => {
    const res = await fetch(`${API_BASE}/modules`);
    return handleResponse(res);
  },

  getModule: async (moduleId) => {
    const res = await fetch(`${API_BASE}/modules/${moduleId}`);
    return handleResponse(res);
  },

  // Assessments
  submitAssessment: async (payload) => {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  getAssessments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/assessments?${query}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getAssessment: async (id) => {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getExplanation: async (id) => {
    const res = await fetch(`${API_BASE}/assessments/${id}/explanation`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Alerts
  getAlerts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/alerts?${query}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  updateAlert: async (id, statusData) => {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(statusData)
    });
    return handleResponse(res);
  },

  // Reviews
  submitReview: async (reviewData) => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(reviewData)
    });
    return handleResponse(res);
  },

  getReviews: async (assessmentId) => {
    const res = await fetch(`${API_BASE}/reviews/assessment/${assessmentId}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Follow-ups
  getFollowUps: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/follow-ups?${query}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  createFollowUp: async (payload) => {
    const res = await fetch(`${API_BASE}/follow-ups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  updateFollowUp: async (id, payload) => {
    const res = await fetch(`${API_BASE}/follow-ups/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Models
  getModels: async () => {
    const res = await fetch(`${API_BASE}/models`);
    return handleResponse(res);
  },

  getModel: async (id) => {
    const res = await fetch(`${API_BASE}/models/${id}`);
    return handleResponse(res);
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit-logs?${query}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Statistics
  getOverviewStats: async () => {
    const res = await fetch(`${API_BASE}/stats/overview`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  }
};
