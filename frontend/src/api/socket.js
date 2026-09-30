import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  // Use VITE_API_URL without /api if provided
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  // Mobile app (Capacitor)
  if (window.location.protocol === 'file:' || window.Capacitor) {
    return 'http://192.168.0.100:5000';
  }
  // Vercel production deployment
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://spicyroute-website.onrender.com';
  }
  // Local development
  return 'http://localhost:5000';
};

export const getSocket = () => {
  if (!socket) {
    const socketUrl = getSocketUrl();
    console.log('⚡ Initializing WebSockets connection to:', socketUrl);
    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('⚡ WebSockets connected successfully [ID:', socket.id, ']');
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ WebSockets connection error (falling back to polling):', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSockets disconnected:', reason);
    });
  }
  return socket;
};
