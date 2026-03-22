import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { STATIC_BASE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';

let socket = null;

export const useSocket = (event, callback) => {
  const { token } = useAuth();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!socket && token) {
      socket = io(STATIC_BASE_URL, { transports: ['websocket'] });
    }
    if (!socket) return;

    const handler = (...args) => callbackRef.current(...args);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, token]);
};
