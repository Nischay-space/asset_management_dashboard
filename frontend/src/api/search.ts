import apiClient from './client';

export interface SearchAssetResult {
  id: number;
  name: string;
  asset_code: string;
}

export interface SearchUserResult {
  id: number;
  name: string;
  email: string | null;
}

export interface SearchResults {
  assets: SearchAssetResult[];
  users: SearchUserResult[];
}

export async function globalSearch(query: string): Promise<SearchResults> {
  const response = await apiClient.get<SearchResults>('/search/', { params: { q: query } });
  return response.data;
}