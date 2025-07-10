import { addYears, endOfYear, format } from 'date-fns';
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
    return '';
  }
};

/**
 * The function getListOfRangesSinceStart generates a list of date ranges starting from a specified
 * date up to the current date, with each range representing a year.
 * @param {string} sinceDate - The `sinceDate` parameter is the starting date from which you want to
 * generate a list of ranges.
 * @param {string} endDate - The `endDate` parameter represents the date until which you want to
 * generate ranges. This function `getListOfRangesSinceStart` will generate a list of ranges starting
 * from the `sinceDate` up to the `endDate`, with each range representing a year.
 * @returns An array of objects representing ranges of dates starting from the `sinceDate` up to the
 * `endDate`, with each object containing a `start` date and an `end` date in the format 'yyyy-MM-dd'.
 */
export const getListOfRangesSinceStart = (
  sinceDate: string,
  endDate: string
) => {
  const startDate = new Date(sinceDate);
  const today = new Date(endDate);
  const ranges = [];
  let current = startDate;
  while (current <= today) {
    ranges.push({
      start: format(current, 'yyyy-MM-dd'),
      end: format(endOfYear(current), 'yyyy-MM-dd')
    });
    current = addYears(current, 1);
  }
  return ranges;
};

/**
 * The function `getSumOfDownloads` calculates the total sum of downloads from an array of objects.
 * @param downloads - An array containing objects with a "downloads" property representing the number
 * of downloads for each item.
 * @returns The function `getSumOfDownloads` is returning the total sum of downloads from the array of
 * objects passed as the `downloads` parameter.
 */
export const getSumOfDownloads = (downloads: []) => {
  return downloads?.reduce((acc, { downloads }) => {
    return acc + downloads;
  }, 0);
};

/**
 * This TypeScript function calculates the total weekly downloads starting from the first Monday in the
 * provided array of download data.
 * @param {any} downloads - The `getWeeklyDownloads` function takes an array of downloads as input and
 * calculates the total downloads for each week starting from the first Monday in the array.
 * @returns The function `getWeeklyDownloads` returns an array of objects containing the day and total
 * downloads for each Monday in the input `downloads` array. Each object in the returned array
 * represents a Monday and its corresponding total downloads for that week.
 */
export const getWeeklyDownloads = (downloads: any) => {
  const firstMonday: any = downloads.findIndex(
    (d: any) => new Date(d.day).getDay() === 1
  );
  return downloads?.slice(firstMonday)?.reduce((acc: any, curr: any) => {
    const isMonday = new Date(curr.day).getDay() === 1;
    if (isMonday) {
      return [
        ...acc,
        {
          day: curr.day,
          downloads: curr.downloads
        }
      ];
    }

    const last = acc[acc.length - 1];
    last.downloads += curr.downloads;
    return acc;
  }, []);
};

/**
 * The function `getMonthlyDownloads` calculates the total downloads per month based on the input data.
 * @param {any} downloads - The `getMonthlyDownloads` function takes an array of downloads as input.
 * Each download object in the array should have a `day` property representing the date of the download
 * and a `downloads` property representing the number of downloads on that day.
 * @returns The function `getMonthlyDownloads` returns an array of objects where each object represents
 * a month with the total downloads for that month. Each object has two properties: `day` which
 * represents the date of the month and `downloads` which represents the total downloads for that
 * month.
 */
export const getMonthlyDownloads = (downloads: any) => {
  return downloads?.reduce((acc: any, curr: any) => {
    const last = acc[acc.length - 1];
    const isNewMonth =
      !last || new Date(curr.day).getMonth() !== new Date(last.day).getMonth();
    if (isNewMonth) {
      return [
        ...acc,
        {
          day: curr.day,
          downloads: curr.downloads
        }
      ];
    }

    last.downloads += curr.downloads;
    return acc;
  }, []);
};

/**
 * The function `getYearlyDownloads` calculates the total downloads per year based on the input data.
 * @param {any} downloads - The `getYearlyDownloads` function takes an array of downloads as input.
 * Each download object in the array should have a `day` property representing the date of the download
 * and a `downloads` property representing the number of downloads on that day.
 * @returns The function `getYearlyDownloads` takes an array of downloads and calculates the total
 * downloads for each year. It returns an array of objects where each object represents a year with the
 * total downloads for that year.
 */
export const getYearlyDownloads = (downloads: any) => {
  return downloads?.reduce((acc: any, curr: any) => {
    const last = acc[acc.length - 1];
    const isNewYear =
      !last ||
      new Date(curr.day).getFullYear() !== new Date(last.day).getFullYear();
    if (isNewYear) {
      return [
        ...acc,
        {
          day: curr.day,
          downloads: curr.downloads
        }
      ];
    }

    last.downloads += curr.downloads;
    return acc;
  }, []);
};

export const generateReleases = (downloads: any) => {
  return {
    total: downloads?.repository?.releases?.totalCount,
    data: downloads?.repository?.releases?.nodes
  };
};

/**
 * The function getRandomApiKey selects a random API key from a given array of API keys.
 * @param {string[]} apiKeys - An array of strings containing API keys.
 * @returns A random API key from the provided array of API keys.
 */
export const getRandomApiKey = (apiKeys: string[]): string => {
  return apiKeys[Math.floor(Math.random() * apiKeys.length)];
};

/**
 * The function `getTransformedScore` takes a score object as input and returns a transformed object
 * with scores for each key.
 * @param {any} score - The `getTransformedScore` function takes an input parameter `score`, which is
 * expected to be an object containing key-value pairs. Each key in the `score` object represents a
 * specific score, and the corresponding value is an object with a `score` property.
 * @returns The `getTransformedScore` function is returning an object where the keys are extracted from
 * the input `score` object, and each key in the returned object contains an object with a `score`
 * property corresponding to the `score` property of the same key in the input `score` object.
 */
export const getTransformedScore = (score: any) => {
  if (!score) {
    return null;
  }

  return Object.keys(score)?.reduce((acc: any, key: any) => {
    if (key) {
      acc[key] = {
        score: score[key]?.score
          ? parseFloat((score[key]?.score * 100)?.toFixed(1))
          : 0,
        component:
          score[key]?.components &&
          Object.keys(score[key]?.components)?.reduce(
            (compAcc: any, compKey: any) => {
              compAcc[compKey] = score[key]?.components[compKey]?.score
                ? parseFloat(
                  (score[key]?.components[compKey]?.maxScore * 100)?.toFixed(
                    1
                  )
                )
                : 0;
              return compAcc;
            },
            {}
          )
      };
      return acc;
    }
  }, {});
};

/**
 * The function `getTransformedAlerts` takes an array of alerts, organizes them by type, and returns a
 * transformed structure.
 * @param {any} alerts - The `getTransformedAlerts` function takes an array of `alerts` as input. Each
 * `alert` object in the array should have a `type` and a `value` property. The `value` property should
 * contain `severity`, `category`, `label`, `description`, and
 * @returns The function `getTransformedAlerts` takes an array of alerts as input and transforms it
 * into an object where alerts are grouped by their type. Each alert object contains the severity,
 * category, label, description, and locations. If the input alerts are missing, an error message is
 * logged and `null` is returned.
 */
export const getTransformedAlerts = (alerts: any) => {
  if (!alerts) {
    return null;
  }

  return alerts?.reduce((acc: any, issue: any) => {
    const { type, value } = issue;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push({
      severity: value.severity,
      category: value.category,
      label: value.label,
      description: value.description,
      locations: value.locations?.map((location: any) => location.value)
    });
    return acc;
  }, {});
};

/**
 * The function `extractFundingURLs` extracts URLs from a nested object structure and returns them in
 * an array.
 * @param {any} funding - The `extractFundingURLs` function takes a `funding` parameter, which can be
 * of any type. The function recursively extracts URLs from the `funding` object and its nested
 * properties. It collects all the URLs found into an array and returns that array if URLs are found,
 * or
 * @returns The function `extractFundingURLs` returns an array of funding URLs extracted from the input
 * `funding` data. If there are URLs found, it returns the array of URLs. If no URLs are found, it
 * returns `null`.
 */
export const extractFundingURLs = (funding: any) => {
  const urls = [];

  (function extract(value) {
    if (!value) return;

    if (typeof value === 'string') {
      urls.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(extract);
    } else if (value.url) {
      urls.push(value.url);
    }
  })(funding);

  return urls?.length > 0 ? urls : null;
};

/**
 * Enhanced performance monitoring utility that tracks API call timing and logs slow requests
 * @param label - Label for the API call being measured
 * @param fn - Function to execute and measure
 * @returns Promise with the result of the function
 */
export const measureTime = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    // Log slow API calls for monitoring
    if (duration > 2000) {
      console.warn(`[SLOW API] ${label} took ${duration}ms`);
    } else if (duration > 1000) {
      console.info(`[API] ${label} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API ERROR] ${label} failed after ${duration}ms:`, error);
    throw error;
  }
};

/**
 * Utility to create a timeout promise for early return strategy
 * @param timeoutMs - Timeout in milliseconds
 * @param message - Error message for timeout
 * @returns Promise that rejects after timeout
 */
export const createTimeout = (timeoutMs: number, message: string): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), timeoutMs);
  });
};

/**
 * Utility to race a promise against a timeout
 * @param promise - Promise to race
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Message for timeout error
 * @returns Promise that either resolves with the result or rejects with timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> => {
  return Promise.race([
    promise,
    createTimeout(timeoutMs, timeoutMessage)
  ]);
};
