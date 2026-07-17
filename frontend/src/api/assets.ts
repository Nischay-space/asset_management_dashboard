import apiClient from './client';
import type { Asset } from '../types/asset';

export interface AssetFilters {
  category?: string;
  commodity_type?: string;
  location?: string;
  status?: string;
  search?: string;
}

export interface FilterOptions {
  categories: string[];
  commodity_types: string[];
  locations: string[];
  statuses: string[];
}

export async function getAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  const response = await apiClient.get<Asset[]>('/assets/', {
    params: filters,
  });
  return response.data;
}


export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await apiClient.get<FilterOptions>('/assets/filter-options');
  return response.data;
}
export async function getAsset(id: number): Promise<Asset> {
  const response = await apiClient.get<Asset>(`/assets/${id}`);
  return response.data;
}
export interface AssetSummaryStats {
  total_assets: number;
  active_assets: number;
  inactive_assets: number;
  total_locations: number;
  total_users: number;
  recently_added: number;
}

export async function getSummary(): Promise<AssetSummaryStats> {
  const response = await apiClient.get<AssetSummaryStats>('/assets/summary');
  return response.data;
}

export async function deleteAsset(id: number): Promise<void> {
  await apiClient.delete(`/assets/${id}`);
}

export interface AssetFormData {
  asset_code?: string;
  name: string;
  category?: string;
  commodity_type?: string;
  brand_name?: string;
  model_name?: string;
  serial_number?: string;
  location?: string;
  status?: string;
}

export async function createAsset(data: AssetFormData): Promise<Asset> {
  const response = await apiClient.post<Asset>('/assets/', data);
  return response.data;
}

export async function updateAsset(id: number, data: Partial<AssetFormData>): Promise<Asset> {
  const response = await apiClient.patch<Asset>(`/assets/${id}`, data);
  return response.data;
}
export async function assignUser(assetId: number, userId: number): Promise<void> {
  await apiClient.post(`/assets/${assetId}/assignments/${userId}`);
}

export async function unassignUser(assetId: number, userId: number): Promise<void> {
  await apiClient.delete(`/assets/${assetId}/assignments/${userId}`);
}