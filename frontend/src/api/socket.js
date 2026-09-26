import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  if (window.location.protocol === 'file:' || window.Capacitor || !window.location.port) {
    return 'http://192.168.0.100:5000';
  }
  return window.location.origin;
};

export const getSocket = () => {
  if (!socket) {
    const socketUrl = getSocketUrl();
    socket = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('⚡ WebSockets connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSockets disconnected');
    });
  }
  return socket;
};
