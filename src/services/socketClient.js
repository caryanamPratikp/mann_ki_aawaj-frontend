import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env.js';

let sharedSocket = null;
let currentToken = null;

export function getSharedSocket() {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    if (sharedSocket) {
      try { sharedSocket.disconnect(); } catch (e) {}
      sharedSocket = null;
      currentToken = null;
    }
    return null;
  }

  if (!sharedSocket || currentToken !== token) {
    if (sharedSocket) {
      try { sharedSocket.disconnect(); } catch (e) {}
    }
    currentToken = token;
    sharedSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      query: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  return sharedSocket;
}
