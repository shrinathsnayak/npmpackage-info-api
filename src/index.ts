import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getPackageDownloads, getPackageInfo } from './controllers/package';
import { getGitHubInfo } from './services/github';
import { getPkgInfo, searchPackage } from './services/npm';
import { getHealth } from './controllers/health';
import { getSecurityScore } from './services/securityscan';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.get('/', (req: Request, res: Response) => {
  const data = getHealth();
  res.status(200).send(data);
});

app.get('/package', async (req: Request, res: Response) => {
  const data = await getPackageInfo(req);
  res.status(200).send(data);
});

app.get('/downloads', async (req: Request, res: Response) => {
  const { packageName, startDate, endDate } = req.query as {
    packageName: string;
    startDate: string;
    endDate: string;
  };
  const data = await getPackageDownloads(packageName, startDate, endDate, {
    dailyDownloads: true
  });
  res.status(200).send(data);
});

app.get('/npm', async (req: Request, res: Response) => {
  const { project, version = 'latest' } = req.query as {
    project: string;
    version: string;
  };
  if (!project) {
    res.send(404).send({
      status: 404,
      message: 'Project name missing'
    });
  } else {
    try {
      const data = await getPkgInfo(project, version);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        status: 500,
        message: 'Internal server error'
      });
    }
  }
});

app.get('/github', async (req: Request, res: Response) => {
  const { owner, repo } = req?.query as { owner: string; repo: string };
  if (!owner || !repo) {
    res.send(404).send({
      status: 404,
      message: 'Either owner or repo is missing.'
    });
  } else {
    try {
      const data = await getGitHubInfo(owner, repo);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        status: 500,
        message: 'Internal server error'
      });
    }
  }
});

app.get('/scan', async (req: Request, res: Response) => {
  const { owner, repo } = req?.query as { owner: string; repo: string };
  if (!owner || !repo) {
    res.send(404).send({
      status: 404,
      message: 'Either owner or repo is missing.'
    });
  } else {
    try {
      const data = await getSecurityScore(owner, repo);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        status: 500,
        message: 'Internal server error'
      });
    }
  }
});

app.get('/search', async (req: Request, res: Response) => {
  const { q, size } = req?.query as { q?: string; size?: number };

  if (!q) {
    res.send(404).send({
      status: 404,
      message: 'Query is missing.'
    });
  } else {
    try {
      const data = await searchPackage(q, size);
      res.send(data);
    } catch (err) {
      res.status(500).send({
        status: 500,
        message: 'Internal server error'
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
