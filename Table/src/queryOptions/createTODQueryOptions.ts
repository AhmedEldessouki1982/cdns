import { todsAPI } from '@/api/todClient';
import { queryOptions } from '@tanstack/react-query';

// http://localhost:3000/pagination?page=1
export const createTODQueryOptions = ({
  page = '1',
}: { page?: string } = {}) => {
  return queryOptions({
    queryKey: ['tod', page],
    queryFn: () => todsAPI.paginationTods({ page }),
    staleTime: 5 * 1000,
  });
};

//// http://localhost:3000/pagination/search?search=pp-001
export const createTODsearchOptions = ({
  searchQuery,
}: {
  searchQuery: string;
}) => {
  return queryOptions({
    queryKey: ['tod', 'search', searchQuery],
    queryFn: () => todsAPI.searchTods({ searchQuery }),
    enabled: !!searchQuery.trim(), // Only run query when searchQuery is not empty
  });
};

//http://localhost:3000/pagination/change-status/:id
export const createTODchangeStatusOptions = ({
  id,
  status,
}: {
  id: number;
  status: boolean;
}) => {
  return queryOptions({
    queryKey: ['tod', 'change-status', id],
    queryFn: () => todsAPI.changeTODstatus(id, status),
  });
};
