import { format } from 'date-fns';
export const FIRST_AVAILABLE_DATE = '2015-01-01';
export const TODAY_DATE = format(new Date(), 'yyyy-MM-dd');
export const ESM = 'ESM';
export const CJS = 'CommonJS';
export const UMD = 'UMD';
export const NA = 'N/A';
export const VULNERABILITIES_ORDER = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'];
export const WHITELIST_DOMAINS = ['https://npmpackage.info', 'http://localhost:3000'];