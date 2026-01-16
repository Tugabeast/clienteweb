import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://193.137.84.23/api',
  baseURL: 'http://localhost:5000',
});

// Adicionado o token ao cabeçalho para cada pedido
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
