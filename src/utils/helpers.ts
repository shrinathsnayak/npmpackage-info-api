import { Edge, LanguageWithPercentage, Languages } from '@/types/github';

export const generateLanguageArray = (languages: Languages | undefined) => {
  if (!languages || !languages.edges) {
    return [];
  }

  const totalSize: number = languages?.totalSize || 0;

  const languageArray: any = languages.edges.map(
    (language: Edge) => ({
      name: language?.node?.name,
      color: language?.node?.color,
      size: language?.size,
      sizePercentage:
        language?.size && ((language?.size / totalSize) * 100)?.toFixed(2)
    })
  );

  return languageArray;
};
