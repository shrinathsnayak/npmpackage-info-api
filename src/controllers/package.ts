import { Request } from 'express';
import { getPkgInfo } from '@/services/npm';
import { getRepositoryInfo } from '@/services/github';

const getPackageInfo = async (req: Request) => {
  const { id } = req.params;
  const pkg = await getPkgInfo(id);
  const gitHub = (await getRepositoryInfo(pkg)) || null;
  return { pkg, gitHub };
};

export default getPackageInfo;
