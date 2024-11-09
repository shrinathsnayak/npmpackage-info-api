import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getPackageDownloads, getPackageInfo } from './controllers/package';
import { getGitHubInfo, getPackageVulnerabilities } from './services/github';
import { getPkgInfo, searchPackage } from './services/npm';
import { getHealth } from './controllers/health';
import { getSecurityScore } from './services/securityscan';
import { terminate, tryCatchWrapper } from './utils/error';
import { handleMissingParameter } from './utils/error';
import messages from './constants/messages';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

const exitHandler = terminate(app, {
  coredump: false,
  timeout: 500
});

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));

app.get('/_health', (req: Request, res: Response) => {
  const data = getHealth();
  res.status(200).send(data);
});

app.get('/package', (req: Request, res: Response) => {
  const { q } = req?.query as { q: string };

  if (!q) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPackageInfo(req);
      res.status(200).send(data);
    })();
  }
});

app.get('/downloads', (req: Request, res: Response) => {
  const {
    packageName,
    startDate,
    endDate,
    getDailyDownloads = true
  } = req.query as {
    packageName: string;
    startDate: string;
    endDate: string;
    getDailyDownloads: any;
  };

  if (!packageName) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPackageDownloads(packageName, startDate, endDate, {
        dailyDownloads: getDailyDownloads
      });
      res.status(200).send(data);
    })();
  }
});

app.get('/npm', (req: Request, res: Response) => {
  const { project, version = 'latest' } = req.query as {
    project: string;
    version: string;
  };
  if (!project) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPkgInfo(project, version);
      res.send(data);
    })();
  }
});

app.get('/github', (req: Request, res: Response) => {
  const { owner, repo } = req?.query as { owner: string; repo: string };
  if (!owner || !repo) {
    handleMissingParameter(res, 404, messages.errors.OWNER_OR_REPO_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getGitHubInfo(owner, repo);
      res.send(data);
    })();
  }
});

app.get('/scan', async (req: Request, res: Response) => {
  const { owner, repo } = req?.query as { owner: string; repo: string };
  if (!owner || !repo) {
    handleMissingParameter(res, 404, messages.errors.OWNER_OR_REPO_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getSecurityScore(owner, repo);
      res.send(data);
    })();
  }
});

app.get('/search', async (req: Request, res: Response) => {
  const { q, size } = req?.query as { q?: string; size?: number };

  if (!q) {
    handleMissingParameter(res, 404, messages.errors.SEARCH_QUERY_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await searchPackage(q, size);
      res.send(data);
    })();
  }
});

app.get('/vulnerabilities', async (req: Request, res: Response) => {
  const { name } = req?.query as { name: string };
  if (!name) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPackageVulnerabilities(name);
      res.send(data);
    })();
  }
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
