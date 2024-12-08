import { CJS, ESM, NA, UMD } from '@/constants';
import {
  NpmTypes,
  NpmMappingType,
  SearchObjectType,
  mapNpmSearchDataMapping
} from '@/types/npm';
import { getProfilePhotoUrl } from '@/utils/gravatar';
import { extractFundingURLs } from '@/utils/helpers';

/**
 * The function `getUserInfo` takes an object as input and returns an object with the name, email, and
 * profile photo URL of the user if the input object is not empty.
 * @param {any} obj - The `obj` parameter is an object that contains user information such as name and
 * email.
 * @returns The function `getUserInfo` returns an object with properties `name`, `email`, and `url`.
 * The values of these properties are obtained from the `obj` parameter. If the `obj` parameter is not
 * empty, the `name` and `email` properties are assigned the corresponding values from `obj`, and the
 * `url` property is assigned the result of calling the `getProfilePhoto`
 */
const getUserInfo = (obj: any) => {
  if (obj && Object.keys(obj).length > 0) {
    return {
      name: obj?.name,
      email: obj?.email,
      url: getProfilePhotoUrl(obj?.email)
    };
  }
};

/**
 * The function `getMaintainers` takes an array of objects, extracts the name and email properties from
 * each object, and returns an array of objects with name, email, and profile photo URL properties.
 * @param {any} array - An array containing objects with properties such as name and email.
 * @returns The function `getMaintainers` returns an array of objects with properties `name`, `email`,
 * and `url`.
 */
const getMaintainers = (array: any) => {
  if (array && array.length > 0) {
    return array.map((item: any) => {
      return {
        name: item?.name,
        email: item?.email,
        url: getProfilePhotoUrl(item?.email)
      };
    });
  }
};

/**
 * The function `getDependencies` takes in an object representing dependencies and returns an object
 * containing the total count of dependencies and the dependency data itself.
 * @param dependecyObject - The `dependecyObject` parameter is an object that represents a collection
 * of dependencies. Each key-value pair in the object represents a dependency, where the key is the
 * name of the dependency and the value is the version of the dependency.
 * @returns The function `getDependencies` returns an object with two properties: `totalCount` and
 * `data`. If the `dependecyObject` parameter is not empty, the `totalCount` property will be set to
 * the number of keys in the `dependecyObject` and the `data` property will be a shallow copy of the
 * `dependecyObject`.
 */
const getDependencies = (dependecyObject: any) => {
  if (dependecyObject && Object.keys(dependecyObject).length > 0) {
    return {
      totalCount: Object.keys(dependecyObject).length,
      data: { ...dependecyObject }
    };
  }
  return null;
};

/**
 * The function `mapNpmData` takes in an object of type `NpmTypes` and returns an object of type
 * `NpmMappingType` with mapped properties from the input object.
 * @param {NpmTypes} npmData - The `npmData` parameter is of type `NpmTypes`.
 * @returns The function `mapNpmData` returns an object of type `NpmMappingType` or `undefined`.
 */
export const mapNpmData = (npmData: NpmTypes): NpmMappingType | any => {
  if (npmData) {
    return {
      status: 200,
      data: {
        name: npmData?.name,
        description: npmData?.description,
        version: npmData?.version,
        license: npmData?.license,
        repositoryUrl: npmData?.repository?.url,
        homepage: npmData?.homepage,
        bugsUrl: npmData?.bugs?.url,
        types: !!npmData?.types,
        minNodeVersion: npmData?.engines?.node,
        npmUser: getUserInfo(npmData?._npmUser),
        collaborators: getMaintainers(npmData?.maintainers),
        moduleFormats: checkModuleSupport(npmData),
        _npmVersion: npmData?._npmVersion,
        _nodeVersion: npmData?._nodeVersion,
        readMe: npmData?.readme,
        funding: extractFundingURLs(npmData?.funding),
        package: {
          id: npmData?._id,
          nodeVersion: npmData?._nodeVersion,
          npmVersion: npmData?._npmVersion,
          size: npmData?.dist?.size,
          unpackedSize: npmData?.dist?.unpackedSize,
          fileCount: npmData?.dist?.fileCount
        },
        publishedOn: npmData?.publish_time,
        dependencies: {
          dependencies:
            npmData?.dependencies && getDependencies(npmData?.dependencies),
          devDependencies:
            npmData?.devDependencies &&
            getDependencies(npmData?.devDependencies),
          peerDependencies:
            npmData?.peerDependencies &&
            getDependencies(npmData?.peerDependencies),
          optionalDependencies:
            npmData?.optionalDependencies &&
            getDependencies(npmData?.optionalDependencies)
        }
      }
    };
  }
};

/**
 * The function `mapNpmSearchData` takes npm search data and maps it to a specific format, returning
 * either the mapped data with a 200 status or a 404 status with a message if no package was found.
 * @param {SearchObjectType} npmData - The `npmData` parameter is an object that contains search
 * results data from an npm search query. It has a specific structure defined by the `SearchObjectType`
 * type. The function `mapNpmSearchData` takes this data and maps it to a new format defined by the
 * `mapNpm
 * @returns The function `mapNpmSearchData` returns an object with a `status` property and either a
 * `data` property containing an array of mapped npm search data or a `message` property indicating
 * that no package was found with the specified name.
 */
export const mapNpmSearchData = (
  npmData: SearchObjectType
): mapNpmSearchDataMapping | any => {
  if (npmData && npmData?.objects?.length > 0) {
    const data = npmData?.objects?.map((item) => {
      return {
        name: item?.package?.name,
        version: item?.package?.version,
        description: item?.package?.description,
        date: item?.package?.date,
        score: {
          searchScore: item?.searchScore,
          final: item?.score?.final,
          details: {
            quality: item?.score?.detail?.quality,
            popularity: item?.score?.detail?.popularity,
            maintenance: item?.score?.detail?.maintenance
          }
        }
      };
    });
    if (data?.length > 0) {
      return {
        status: 200,
        data: data
      };
    }
  } else {
    return {
      status: 404,
      message: 'No package was found with the specified name'
    };
  }
};

/**
 * The function `checkModuleSupport` determines the supported module formats based on package data in
 * TypeScript.
 * @param {any} packageData - The `packageData` parameter in the `checkModuleSupport` function is an
 * object that contains information about a package, such as its main file, type (whether it is a
 * module or not), exports, browser compatibility, and umd (Universal Module Definition) support. The
 * function checks this data
 * @returns The function `checkModuleSupport` returns a string that represents the supported module
 * types based on the `packageData` provided. The supported module types are determined by checking
 * various properties of the `packageData` object. If any of the conditions are met, the corresponding
 * module type is added to the `supportedModules` array. Finally, the function returns a
 * comma-separated string of the supported module types if there are any, or 'N/A' if no module types are supported.
 */
export const checkModuleSupport = (packageData: any) => {
  try {
    const supportedModules = [];

    if (packageData.main && packageData.type !== 'module')
      supportedModules.push(CJS);
    if (packageData.exports || packageData.type === 'module')
      supportedModules.push(ESM);
    if (packageData.browser || packageData.umd) supportedModules.push(UMD);

    return supportedModules.length > 0 ? supportedModules.join(', ') : NA;
  } catch (error) {
    return NA;
  }
};
