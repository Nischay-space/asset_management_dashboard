import apiClient from './client';
import type { Asset } from '../types/asset';

export interface AssetFilters {
  category?: string;
  commodity_type?: string;
  location?: string;
  status?: string;
}

export async function getAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  const response = await apiClient.get<Asset[]>('/assets/', {
    params: filters,
  });
  return response.data;
}