import { mapNpmData } from '@/mapping/npm';
import axios, { AxiosResponse } from 'axios';

export const getPkgInfo = async (pkg: string, version = 'latest') => {
  try {
    const url = `https://registry.npmjs.org/${encodeURIComponent(pkg)}/${version}`;
    const response: AxiosResponse = await axios.get(url);
    return mapNpmData(response.data);
  } catch (e) {
    console.error(e);
  }
};
