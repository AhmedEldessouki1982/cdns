import { ragAPI } from '@/api/rag';
import { queryOptions } from '@tanstack/react-query';

export const createRAGQueryOptions = (askAI: { question: string }) => {
  return queryOptions({
    queryKey: ['rag'],
    queryFn: () => ragAPI.initiatePdf(askAI.question),
  });
};
