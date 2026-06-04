import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface WatchRoom {
  currentTitle: string | null;
  notes: string;
  users: Map<string, { socketId: string; userId: string; displayName: string }>;
}

const rooms = new Map<string, WatchRoom>();
const SHARED_ROOM = 'watch-together-main';

export function initWatchTogetherSocket(io: Server) {
  const nsp = io.of('/watch-together');

  nsp.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
      (socket as Socket & { userId: string }).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  nsp.on('connection', (socket: Socket & { userId?: string }) => {
    socket.on('join-room', ({ displayName }: { displayName: string }) => {
      socket.join(SHARED_ROOM);

      if (!rooms.has(SHARED_ROOM)) {
        rooms.set(SHARED_ROOM, { currentTitle: null, notes: '', users: new Map() });
      }

      const room = rooms.get(SHARED_ROOM)!;
      room.users.set(socket.id, { socketId: socket.id, userId: socket.userId!, displayName });

      // Send current state to joining user
      socket.emit('room-state', {
        currentTitle: room.currentTitle,
        notes: room.notes,
        userCount: room.users.size,
      });

      nsp.to(SHARED_ROOM).emit('user-joined', { displayName, userCount: room.users.size });
    });

    socket.on('sync-status', ({ title }: { title: string }) => {
      const room = rooms.get(SHARED_ROOM);
      if (room) room.currentTitle = title;
      socket.to(SHARED_ROOM).emit('sync-status', { title });
    });

    socket.on('send-reaction', ({ emoji }: { emoji: string }) => {
      socket.to(SHARED_ROOM).emit('reaction', { emoji });
    });

    socket.on('update-notes', ({ notes }: { notes: string }) => {
      const room = rooms.get(SHARED_ROOM);
      if (room) room.notes = notes;
      socket.to(SHARED_ROOM).emit('notes-updated', { notes });
    });

    socket.on('disconnect', () => {
      const room = rooms.get(SHARED_ROOM);
      if (room) {
        room.users.delete(socket.id);
        nsp.to(SHARED_ROOM).emit('user-left', { userCount: room.users.size });
      }
    });
  });
}
