import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gbrentals_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gbrentals_token');
      localStorage.removeItem('gbrentals_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);
export default api;

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const authAPI = {
  register:       (d: any)           => api.post('/auth/register', d),
  login:          (d: any)           => api.post('/auth/login', d),
  getMe:          ()                 => api.get('/auth/me'),
  updateProfile:  (d: any)           => api.put('/auth/profile', d),
  changePassword: (d: any)           => api.put('/auth/password', d),
};
export const propertyAPI = {
  getAll:      (p?: any)             => api.get('/properties', { params: p }),
  getFeatured: ()                    => api.get('/properties/featured'),
  getOne:      (id: string)          => api.get(`/properties/${id}`),
  create:      (d: FormData)         => api.post('/properties', d, multipart),
  update:      (id: string, d: FormData) => api.put(`/properties/${id}`, d, multipart),
  delete:      (id: string)          => api.delete(`/properties/${id}`),
};
export const inquiryAPI = {
  send:    (pId: string, d: any)     => api.post(`/inquiries/${pId}`, d),
  getMine: ()                        => api.get('/inquiries/my'),
  getOwner:()                        => api.get('/inquiries/owner'),
  reply:   (id: string, r: string)   => api.put(`/inquiries/${id}/reply`, { reply: r }),
};
export const favoriteAPI = {
  getAll:  ()                        => api.get('/favorites'),
  toggle:  (pId: string)             => api.post(`/favorites/${pId}`),
};
export const bookingAPI = {
  create:       (pId: string, d: FormData) => api.post(`/bookings/${pId}`, d, multipart),
  getMine:      ()                          => api.get('/bookings/my'),
  getOwner:     ()                          => api.get('/bookings/owner'),
  getOne:       (id: string)               => api.get(`/bookings/${id}`),
  approve:      (id: string, d?: any)      => api.put(`/bookings/${id}/approve`, d),
  reject:       (id: string, d?: any)      => api.put(`/bookings/${id}/reject`, d),
  getAdminAll:  ()                          => api.get('/bookings/admin/all'),
};
export const transactionAPI = {
  create:       (bId: string, d: FormData) => api.post(`/transactions/${bId}`, d, multipart),
  getByBooking: (bId: string)              => api.get(`/transactions/booking/${bId}`),
  getMine:      ()                          => api.get('/transactions/my'),
  getReceived:  ()                          => api.get('/transactions/received'),
  verify:       (id: string, d: any)       => api.put(`/transactions/${id}/verify`, d),
  getAdminAll:  ()                          => api.get('/transactions/admin/all'),
};
export const adminAPI = {
  getDashboard:    ()                       => api.get('/admin/dashboard'),
  getProperties:   (status?: string)        => api.get('/admin/properties', { params: { status } }),
  approveProperty: (id: string)             => api.put(`/admin/properties/${id}/approve`),
  rejectProperty:  (id: string, reason?: string) => api.put(`/admin/properties/${id}/reject`, { reason }),
  updateProperty:  (id: string, d: any)    => api.put(`/admin/properties/${id}`, d),
  getUsers:        ()                       => api.get('/admin/users'),
  updateUser:      (id: string, d: any)    => api.put(`/admin/users/${id}`, d),
  deleteUser:      (id: string)             => api.delete(`/admin/users/${id}`),
};
export const ownerAPI = {
  getDashboard:  ()                          => api.get('/owner/dashboard'),
  getProperties: ()                          => api.get('/owner/properties'),
  updateStatus:  (id: string, s: string)    => api.put(`/owner/properties/${id}/status`, { status: s }),
};

// ── Owner extended (bookings + transactions) ──────────────────────────────────
export const ownerExtAPI = {
  getBookings:       ()                          => api.get('/owner/bookings'),
  approveBooking:    (id: string, d?: any)       => api.put(`/owner/bookings/${id}/approve`, d),
  rejectBooking:     (id: string, d?: any)       => api.put(`/owner/bookings/${id}/reject`, d),
  getTransactions:   ()                          => api.get('/owner/transactions'),
  verifyTransaction: (id: string, d: any)        => api.put(`/owner/transactions/${id}/verify`, d),
};
