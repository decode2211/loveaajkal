import './config/env'; // validate env first
import 'express-async-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { initWatchTogetherSocket } from './sockets/watchTogether.socket';

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

initWatchTogetherSocket(io);

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/v1', apiRoutes);

app.use(errorMiddleware);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`🌍 Accepting requests from: ${env.CLIENT_URL}`);
});

export { app, httpServer };
