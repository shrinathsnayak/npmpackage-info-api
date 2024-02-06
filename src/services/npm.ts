import axios, { AxiosResponse } from 'axios';

export const getPkgInfo = async (pkg: string) => {
  try {
    const url = `https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`;
    const response: AxiosResponse = await axios.get(url);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};
