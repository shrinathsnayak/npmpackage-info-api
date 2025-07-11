import os from 'os';
import cluster from 'cluster';

const totalCPUs = os.cpus().length;

export function setupProductionClustering() {
  // Skip clustering in development for faster startup
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Skipping clustering for faster startup');
    return;
  }

  if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Primary ${process.pid} is running`);

    for (let i = 0; i < totalCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker) => {
      console.log(`worker ${worker.process.pid} died`);
      console.log("Let's fork another worker!");
      cluster.fork();
    });
  }
}

export function isWorkerProcess(): boolean {
  return !cluster.isPrimary || process.env.NODE_ENV !== 'production';
}