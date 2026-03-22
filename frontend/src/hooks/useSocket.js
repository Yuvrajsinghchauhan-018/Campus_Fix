import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { STATIC_BASE_URL } from '../api/axios';

// Initialize a single global socket instance
const socket = io(STATIC_BASE_URL, {
    transports: ['websocket', 'polling']
});

export const useSocket = (event, callback) => {
    useEffect(() => {
        socket.on(event, callback);
        return () => {
            socket.off(event, callback);
        };
    }, [event, callback]);
};
