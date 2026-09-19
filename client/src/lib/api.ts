import axios, { AxiosError } from 'axios';
import type {
  ApiEnvelope,
  AuditAction,
  AuditResourceType,
  AuditEvent,
  SecurityStatus,
  VaultItem,
  VaultItemType,
  VaultMetadata,
  VaultOverview,
  WrappedVaultKey,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export interface ApiClientError {
  status: number;
  message: string;
  details?: unknown;
}

export function toApiError(err: unknown): ApiClientError {
  if (axios.isAxiosError<ApiEnvelope<never>>(err)) {
    const axiosErr = err as AxiosError<ApiEnvelope<never>>;
    return {
      status: axiosErr.response?.status ?? 0,
      message: axiosErr.response?.data?.message ?? 'Unable to reach the vault service',
      details: axiosErr.response?.data?.details,
    };
  }
  return { status: 0, message: 'Unexpected error' };
}

/**
 * Clerk session tokens are fetched lazily (async) via a provider registered
 * by the app bootstrap. Keeps axios instances secret-agnostic.
 */
let tokenProvider: (() => Promise<string | null>) | null = null;
export function registerAuthTokenProvider(provider: () => Promise<string | null>): void {
  tokenProvider = provider;
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = tokenProvider ? await tokenProvider() : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap<T>(payload: ApiEnvelope<T>): T {
  return payload.data;
}

export interface VaultListParams {
  type?: VaultItemType;
  favorite?: boolean;
  q?: string;
}

export interface CreateVaultItemInput {
  type: VaultItemType;
  title: string;
  encryptedPayload: string;
  iv: string;
  tag: string;
  encryptionVersion: number;
  metadata: VaultMetadata;
  favorite?: boolean;
}

export type UpdateVaultItemInput = Partial<Omit<CreateVaultItemInput, 'type'> & { favorite: boolean }>;

export const vaultApi = {
  async list(params: VaultListParams = {}): Promise<VaultItem[]> {
    const query: Record<string, string | undefined> = {};
    if (params.type) query.type = params.type;
    if (params.favorite !== undefined) query.favorite = String(params.favorite);
    if (params.q) query.q = params.q;
    const res = await api.get<ApiEnvelope<VaultItem[]>>('/api/v1/vault', { params: query });
    return unwrap(res.data);
  },

  async get(id: string): Promise<VaultItem> {
    const res = await api.get<ApiEnvelope<VaultItem>>(`/api/v1/vault/${id}`);
    return unwrap(res.data);
  },

  async create(input: CreateVaultItemInput): Promise<VaultItem> {
    const res = await api.post<ApiEnvelope<VaultItem>>('/api/v1/vault', input);
    return unwrap(res.data);
  },

  async update(id: string, input: UpdateVaultItemInput): Promise<VaultItem> {
    const res = await api.patch<ApiEnvelope<VaultItem>>(`/api/v1/vault/${id}`, input);
    return unwrap(res.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/v1/vault/${id}`);
  },

  async overview(): Promise<VaultOverview> {
    const res = await api.get<ApiEnvelope<VaultOverview>>('/api/v1/vault/overview');
    return unwrap(res.data);
  },
};

export const activityApi = {
  async list(limit = 30): Promise<{ data: AuditEvent[]; nextCursor: string | null }> {
    const res = await api.get<ApiEnvelope<AuditEvent[]>>('/api/v1/activity', {
      params: { limit },
    });
    return { data: res.data.data, nextCursor: null };
  },

  async report(action: AuditAction, resourceType: AuditResourceType, resourceId?: string): Promise<void> {
    try {
      await api.post('/api/v1/activity', { action, resourceType, resourceId });
    } catch {
      // Activity reporting must never interrupt the user's flow.
    }
  },
};

export const keysApi = {
  async get(): Promise<WrappedVaultKey | null> {
    const res = await api.get<ApiEnvelope<WrappedVaultKey | null>>('/api/v1/keys');
    return res.data.data;
  },
  async upsert(wrapper: Omit<WrappedVaultKey, 'keyVersion'>): Promise<WrappedVaultKey> {
    const res = await api.put<ApiEnvelope<WrappedVaultKey>>('/api/v1/keys', wrapper);
    return unwrap(res.data);
  },
  async remove(): Promise<void> {
    await api.delete('/api/v1/keys');
  },
};

export const securityApi = {
  async status(): Promise<SecurityStatus> {
    const res = await api.get<ApiEnvelope<SecurityStatus>>('/api/v1/security/status');
    return unwrap(res.data);
  },
};