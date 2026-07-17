import apiClient from './client';

export interface DuplicateUserRef {
  id: number;
  name: string;
  email: string | null;
  asset_count: number;
}

export interface DuplicateCandidate {
  user_a: DuplicateUserRef;
  user_b: DuplicateUserRef;
  similarity: number;
  reason: string;
}


export async function getDuplicateCandidates(): Promise<DuplicateCandidate[]> {
  const response = await apiClient.get<DuplicateCandidate[]>('/duplicates/');
  return response.data;
}

export async function dismissPair(userIdA: number, userIdB: number): Promise<void> {
  await apiClient.post('/duplicates/dismiss', { user_id_a: userIdA, user_id_b: userIdB });
}

export async function mergeUsers(keepUserId: number, removeUserId: number): Promise<void> {
  await apiClient.post('/duplicates/merge', { keep_user_id: keepUserId, remove_user_id: removeUserId });
}