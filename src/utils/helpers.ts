import { Edge, Languages } from '@/types/github';

/**
 * The function `generateLanguageArray` takes a `Languages` object, extracts relevant data from its
 * `edges` property, calculates size percentages, and returns an array of language objects.
 * @param {Languages | undefined} languages - The `generateLanguageArray` function takes in a parameter
 * `languages`, which is of type `Languages` or `undefined`. The function checks if `languages` is
 * defined and if it has `edges` property. If not, it returns an empty array.
 * @returns An array of objects containing information about programming languages, including name,
 * color, size, and size percentage.
 */
export const generateLanguageArray = (languages: Languages | undefined) => {
  if (!languages || !languages.edges) {
    return [];
  }

  const totalSize: number = languages?.totalSize || 0;

  const languageArray: any = languages.edges.map((language: Edge) => ({
    name: language?.node?.name,
    color: language?.node?.color,
    size: language?.size,
    sizePercentage:
      language?.size && ((language?.size / totalSize) * 100)?.toFixed(2)
  }));

  return languageArray;
};

/**
 * The `base64Decode` function decodes a base64 encoded string into a regular string in TypeScript.
 * @param {string} base64EncodedString - Base64 encoded string that you want to decode.
 * @returns The `base64Decode` function returns a decoded string after decoding the input base64
 * encoded string. If an error occurs during the decoding process, an empty string is returned.
 */
export const base64Decode = (base64EncodedString: string): string => {
  try {
    const decodedString = decodeURIComponent(escape(atob(base64EncodedString)));
    return decodedString;
  } catch (error) {
    console.error('Error decoding base64 string:', error);
    return '';
  }
};
