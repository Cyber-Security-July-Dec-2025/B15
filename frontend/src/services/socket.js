import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (userData) => {
  socket = io('http://localhost:5000');
  
  socket.emit('join', userData);
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
