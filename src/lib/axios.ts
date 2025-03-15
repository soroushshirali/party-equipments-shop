import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export default axiosInstance; 