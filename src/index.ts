import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import getPackageInfo from './controllers/package';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.get('/', (req: Request, res: Response) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date()
  };

  res.status(200).send(data);
});

app.get('/package/:id*', async (req: Request, res: Response) => {
  // console.log(req);
  const data = await getPackageInfo(req);
  res.status(200).send(data);
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
