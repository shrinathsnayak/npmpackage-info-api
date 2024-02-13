import { Request } from 'express';

/**
 * The function `getPackageId` takes a request object and returns a package ID by concatenating the
 * `id` parameter with an optional additional parameter.
 * @param {RequestType} req - The parameter `req` is of type `RequestType`.
 * @returns a string value.
 */
export const getPackageId = (req: Request) => {
  return req.params?.[0]
    ? `${req.params?.id}${req.params?.[0]}`
    : req.params?.id;
};
