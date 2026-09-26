const getBaseUrl = () => {
  // Use env variable if set (production/Vercel deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Native app (Capacitor)
  if (window.location.protocol === 'file:' || window.Capacitor) {
    return 'http://192.168.0.100:5000/api';
  }
  // Local dev: use Vite proxy
  return '/api';
};

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const baseUrl = getBaseUrl();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    if (!endpoint.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  if (options.responseType === 'blob') {
    if (!response.ok) throw new Error('Failed to download file');
    return await response.blob();
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An API error occurred');
  }

  return data;
}
