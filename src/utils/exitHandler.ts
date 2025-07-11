import { Express } from 'express';
import { terminate } from './error';

export function setupExitHandler(app: Express) {
  // Disable exit handler in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Exit handler disabled in development mode');
    return;
  }

  const exitHandler = terminate(app, {
    coredump: false,
    timeout: 500
  });

  process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
  process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
  process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
  process.on('SIGINT', exitHandler(0, 'SIGINT'));

  console.log('Exit handler enabled for production');
}