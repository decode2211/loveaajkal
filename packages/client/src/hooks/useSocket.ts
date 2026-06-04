import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export function useSocket(namespace: string = '') {
  const socketRef = useRef<Socket | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const socketUrl = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001') + namespace;

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      auth: { token: '' },
      autoConnect: true,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [namespace, user]);

  return socketRef.current;
}
