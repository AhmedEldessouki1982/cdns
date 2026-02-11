//Table/src/api/todClient.ts

import axios from 'axios';
import type { TableData } from '@/components/Table/Table';

const baseURL = 'http://localhost:3000/';

//create a client instance
const client = axios.create({
  baseURL,
});

//get all tods
const getAllTods = async (): Promise<TableData[]> => {
  const response = await client.get<TableData[]>('/tods');
  return response.data;
};

//get tods based on url conditions
const getPagination = async ({
  page,
}: {
  page: string;
}): Promise<{ todCount: number; openTod: number; data: TableData[] }> => {
  const res = await client.get<{ todCount: number; openTod: number; data: TableData[] }>(`/pagination?page=${page}`);
  return res.data;
};

//searching api
// http://localhost:3000/pagination/search?search=pp-001
const getSearch = async ({
  searchQuery,
}: {
  searchQuery: string;
}): Promise<TableData[]> => {
  const res = await client.get<TableData[]>(
    `/pagination/search?search=${searchQuery}`
  );
  return res.data;
};

//export tods api hooks
export const todsAPI = {
  fetchAllTods: getAllTods,
  paginationTods: getPagination,
  searchTods: getSearch,
};
