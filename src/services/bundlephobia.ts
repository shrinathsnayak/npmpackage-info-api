import axios, { AxiosResponse } from 'axios';

export const getBundlePhobiaData = async (pkg: string) => {
  try {
    const url = `https://bundlephobia.com/api/size?package=${pkg}`;
    const response: AxiosResponse = await axios.get(url);
    return response.data;
  } catch (e: any) {
    return {
      error: e?.response?.status,
      message: e?.response?.data?.error?.message
    };
  }
};
