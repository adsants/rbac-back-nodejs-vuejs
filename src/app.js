import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';



import { env } from './config/env.js';
import logger, { stream as loggerStream } from './config/logger.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import menusRoutes from './routes/menus.routes.js';
import roleMenuRoutes from './routes/roleMenu.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(helmet({
  // izinkan resource (image/fonts) dipakai lintas origin (5173 -> 3000)
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // optional: agar window.open masih aman
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

app.use(morgan('combined', { stream: loggerStream }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/role-menu', roleMenuRoutes);
app.use('/api/profile', profileRoutes);

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // cache 1 hari (opsional, biar gak sering 304)
    res.setHeader('Cache-Control', 'public, max-age=86400');
    next();
  },
  express.static(path.join(process.cwd(), 'uploads'))
);

app.use(notFound);
app.use(errorHandler);

export default app;
