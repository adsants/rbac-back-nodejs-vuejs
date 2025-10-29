import app from './app.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import './bootstrap.js';

const port = env.PORT || 3000;
app.listen(port, () => {
  logger.info(`API listening on http://localhost:${port}`);
});
