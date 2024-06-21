import { CheckType, MapDataType, SecurityScan } from "@/types/securityscan";

export const OVERALL_SCORE = 10;

/**
 * The function `mapScanData` takes a `SecurityScan` object as input and maps its data to a specific
 * format defined by `MapDataType`.
 * @param {SecurityScan} data - The `mapScanData` function takes in a parameter `data` of type
 * `SecurityScan`. This function maps the data from the `SecurityScan` object to a new object of type
 * `MapDataType`. The new object includes properties such as `status`, `lastScanned`, `overallScore
 * @returns The function `mapScanData` takes a `SecurityScan` object as input and returns a
 * `MapDataType` object.
 */
export const mapScanData = (data: SecurityScan): MapDataType => {
  return {
    status: 200,
    data: {
      lastScanned: data?.date,
      overallScore: OVERALL_SCORE,
      score: data?.score,
      checks: data?.checks?.sort((a: any, b: any) => b.score - a.score)?.map((item: CheckType) => {
        if (item && item.score !== undefined && item.score >= 0) {
          return {
            name: item.name,
            score: item.score,
            reason: item.reason,
            details: item.details,
            description: item.documentation?.short
          };
        }
      }).filter(Boolean) ?? []
    }
  }
}