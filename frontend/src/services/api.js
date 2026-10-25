import axios from 'axios';

// Gunakan URL backend langsung jika proxy tidak aktif, atau default /api
const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const getMataKuliah = async () => {
  const res = await api.get('/mata-kuliah');
  return res.data;
};

export const getKrs = async () => {
  const res = await api.get('/krs');
  return res.data;
};

export const addKrsItem = async (courseId) => {
  const res = await api.post('/krs', { course_id: courseId });
  return res.data;
};

export const deleteKrsItem = async (courseOrItemId) => {
  const res = await api.delete(`/krs/${courseOrItemId}`);
  return res.data;
};

export const ajukanKrs = async () => {
  const res = await api.post('/krs/ajukan');
  return res.data;
};

export const resetDemoKrs = async (action = 'reset') => {
  const res = await api.post('/krs/reset', { action });
  return res.data;
};

export default api;
