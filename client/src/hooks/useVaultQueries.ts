import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityApi, vaultApi, type CreateVaultItemInput, type VaultListParams } from '../lib/api';
import type { AuditEvent, VaultOverview } from '../types';

export const QUERY_KEYS = {
  vault: 'vault',
  overview: 'vault-overview',
  activity: 'activity',
  auditCount: 'audit-count',
} as const;

export function useVaultOverview(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.overview],
    queryFn: (): Promise<VaultOverview> => vaultApi.overview(),
    enabled,
  });
}

export function useVaultItems(params: VaultListParams = {}, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.vault, params],
    queryFn: () => vaultApi.list(params),
    enabled,
  });
}

export function useVaultItem(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.vault, 'item', id],
    queryFn: () => vaultApi.get(id as string),
    enabled: Boolean(id) && enabled,
  });
}

export function useActivity() {
  return useQuery({
    queryKey: [QUERY_KEYS.activity],
    queryFn: (): Promise<AuditEvent[]> => activityApi.list(40).then((r) => r.data),
  });
}

export function useVaultMutations(enabled = true) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.vault] });
    void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.overview] });
  };

  const create = useMutation({
    mutationFn: (input: CreateVaultItemInput) => vaultApi.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof vaultApi.update>[1] }) =>
      vaultApi.update(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => vaultApi.remove(id),
    onSuccess: invalidate,
  });

  const toggleFavorite = useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      vaultApi.update(id, { favorite }),
    onSuccess: invalidate,
  });

  return { create, update, remove, toggleFavorite, ready: enabled };
}