import apiClient from './client';
import type { UserWithAssets } from '../types/asset';

export interface UserFormData {
  name: string;
  email?: string;
  role: string;
}

export async function createUser(data: UserFormData): Promise<UserWithAssets> {
  const response = await apiClient.post<UserWithAssets>('/users/', data);
  return response.data;
}

export async function updateUser(id: number, data: Partial<UserFormData>): Promise<UserWithAssets> {
  const response = await apiClient.patch<UserWithAssets>(`/users/${id}`, data);
  return response.data;
}

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