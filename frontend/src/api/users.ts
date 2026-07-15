import apiClient from './client';
import type { UserWithAssets } from '../types/asset';

export async function getUsers(): Promise<UserWithAssets[]> {
  const response = await apiClient.get<UserWithAssets[]>('/users/');
  return response.data;
}

export async function getUser(id: number): Promise<UserWithAssets> {
  const response = await apiClient.get<UserWithAssets>(`/users/${id}`);
  return response.data;
}


  export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}