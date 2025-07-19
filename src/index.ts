import dotenv from 'dotenv';
import express, { Express } from 'express';
import { setupMiddleware } from '@/utils/setupMiddleware';
import {
  setupProductionClustering,
  isWorkerProcess
} from '@/utils/serverSetup';
import { setupExitHandler } from '@/utils/exitHandler';
import {
  healthRoutes,
  packageRoutes,
  downloadsRoutes,
  githubRoutes,
  searchRoutes,
  securityRoutes
} from '@/routes';

dotenv.config();

const port = process.env.PORT || 8000;

setupProductionClustering();

if (isWorkerProcess()) {
  const app: Express = express();

  setupMiddleware(app);
  setupExitHandler(app);

  // Register routes
  app.use(healthRoutes);
  app.use(packageRoutes);
  app.use(downloadsRoutes);
  app.use(githubRoutes);
  app.use(searchRoutes);
  app.use(securityRoutes);

  app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
  });
}
