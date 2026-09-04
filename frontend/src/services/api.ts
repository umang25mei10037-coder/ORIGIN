import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const fetchOverview = () => api.get('/api/overview').then(r => r.data);
export const fetchStates = () => api.get('/api/states').then(r => r.data);
export const fetchDistricts = () => api.get('/api/districts').then(r => r.data);
export const fetchDistrictDetail = (name: string) => api.get(`/api/districts/${encodeURIComponent(name)}`).then(r => r.data);
export const fetchClaims = (params?: Record<string, unknown>) => api.get('/api/claims', { params }).then(r => r.data);
export const fetchClaimDetail = (id: string) => api.get(`/api/claims/${encodeURIComponent(id)}`).then(r => r.data);
export const fetchMapPoints = (params?: Record<string, unknown>) => api.get('/api/claims/map/points', { params }).then(r => r.data);
export const fetchAnomalies = (params?: Record<string, unknown>) => api.get('/api/anomalies', { params }).then(r => r.data);
export const fetchPriorityQueue = () => api.get('/api/priority-queue').then(r => r.data);
export const fetchEvidence = (claimId: string) => api.get(`/api/evidence/${encodeURIComponent(claimId)}`).then(r => r.data);
export const fetchEarlyWarnings = () => api.get('/api/early-warning').then(r => r.data);
export const postWhatIf = (data: { investigation_capacity: number; priority_threshold: number; weeks: number }) => api.post('/api/what-if', data).then(r => r.data);
export const postCopilot = (query: string) => api.post('/api/copilot', { query }).then(r => r.data);
export const fetchHealth = () => api.get('/api/health').then(r => r.data);

export default api;
