import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  rawToCryptoKey,
  unwrapVaultKey,
  wrapVaultKey,
  VaultUnlockError,
} from '../crypto/vaultCrypto';
import { setSessionKey } from '../crypto/sessionKey';
import {
  AUTO_LOCK_DEFAULT,
  AUTO_LOCK_MS,
  type AutoLockValue,
  type WrappedVaultKey,
} from '../types';
import { activityApi, keysApi, registerAuthTokenProvider, securityApi, vaultApi } from '../lib/api';

export type VaultPhase = 'loading' | 'setup-needed' | 'locked' | 'unlocked';

interface VaultContextValue {
  phase: VaultPhase;
  userId: string | null;
  wrapper: WrappedVaultKey | null;
  hasUnlockKey: boolean;
  autoLock: AutoLockValue;
  setAutoLock: (value: AutoLockValue) => void;
  lastUnlockedAt: number | null;
  setupVault: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<void>;
  resetVault: () => Promise<void>;
  lock: () => void;
  refreshStatus: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

const STORAGE_KEY = 'vaultbank.autolock';

function readAutoLock(): AutoLockValue {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'never') return 'never';
    if (value && (Object.keys(AUTO_LOCK_MS) as string[]).includes(value)) {
      return value as Exclude<AutoLockValue, 'never'>;
    }
  } catch {
    // ignore storage errors
  }
  return AUTO_LOCK_DEFAULT;
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();

  const [phase, setPhase] = useState<VaultPhase>('loading');
  const [wrapper, setWrapper] = useState<WrappedVaultKey | null>(null);
  const [hasUnlockKey, setHasUnlockKey] = useState(false);
  const [autoLock, setAutoLockState] = useState<AutoLockValue>(readAutoLock);
  const [lastUnlockedAt, setLastUnlockedAt] = useState<number | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Wire the axios auth token provider to the live Clerk session.
  useEffect(() => {
    registerAuthTokenProvider(() => getTokenRef.current());
  }, []);

  const lock = useCallback(() => {
    setSessionKey(null, null, null);
    setPhase((prev) => (prev === 'unlocked' ? 'locked' : prev));
    void activityApi.report('LOCK', 'vault');
  }, []);

  // Sync vault lifecycle with the Clerk session.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setSessionKey(null, null, null);
      setWrapper(null);
      setHasUnlockKey(false);
      setPhase('loading');
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        setPhase('loading');
        const status = await securityApi.status();
        if (cancelled) return;
        setHasUnlockKey(status.hasUnlockKey);

        if (!status.hasUnlockKey) {
          setWrapper(null);
          setPhase('setup-needed');
          return;
        }
        const stored = await keysApi.get();
        if (cancelled) return;
        setWrapper(stored);
        setPhase('locked');
      } catch {
        if (!cancelled) setPhase('locked');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  // Auto-lock timer while unlocked.
  useEffect(() => {
    if (phase !== 'unlocked' || autoLock === 'never') return;
    const duration = AUTO_LOCK_MS[autoLock];

    let timer: ReturnType<typeof setTimeout> | null = null;
    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => lock(), duration);
    };

    reset();
    const listeners: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    for (const event of listeners) window.addEventListener(event, reset);
    return () => {
      for (const event of listeners) window.removeEventListener(event, reset);
      if (timer) clearTimeout(timer);
    };
  }, [phase, autoLock, lock]);

  const setAutoLock = useCallback((value: AutoLockValue) => {
    setAutoLockState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
  }, []);

  const setupVault = useCallback(
    async (pin: string) => {
      if (!userId) throw new Error('Not signed in');
      const { wrapper: wrapped, raw } = await wrapVaultKey(pin);
      const stored = await keysApi.upsert({
        salt: wrapped.salt,
        iv: wrapped.iv,
        wrappedKey: wrapped.wrappedKey,
        iterations: wrapped.iterations,
      });
      setWrapper(stored);
      const key = await rawToCryptoKey(raw);
      setSessionKey(key, raw, userId);
      setLastUnlockedAt(Date.now());
      setHasUnlockKey(true);
      setPhase('unlocked');
      void activityApi.report('SETUP', 'vault');
    },
    [userId],
  );

  const unlock = useCallback(
    async (pin: string) => {
      if (!userId) throw new Error('Not signed in');
      let wrapped = wrapper;
      if (!wrapped) {
        wrapped = await keysApi.get();
        if (!wrapped) throw new VaultUnlockError();
        setWrapper(wrapped);
      }
      const raw = await unwrapVaultKey(wrapped, pin);
      const key = await rawToCryptoKey(raw);
      setSessionKey(key, raw, userId);
      setLastUnlockedAt(Date.now());
      setPhase('unlocked');
      void activityApi.report('UNLOCK', 'vault');
    },
    [userId, wrapper],
  );

  const changePin = useCallback(
    async (oldPin: string, newPin: string) => {
      if (!wrapper) throw new VaultUnlockError();
      // Re-verify the current PIN, then re-wrap the raw key under the new PIN.
      const raw = await unwrapVaultKey(wrapper, oldPin);
      const { wrapper: rewrapped } = await wrapVaultKey(newPin, raw);
      const stored = await keysApi.upsert({
        salt: rewrapped.salt,
        iv: rewrapped.iv,
        wrappedKey: rewrapped.wrappedKey,
        iterations: rewrapped.iterations,
      });
      setWrapper(stored);
    },
    [wrapper],
  );

  const resetVault = useCallback(async () => {
    if (!userId) return;
    await keysApi.remove();
    const items = await vaultApi.list();
    await Promise.all(items.map((item) => vaultApi.remove(item._id)));
    setSessionKey(null, null, null);
    setWrapper(null);
    setHasUnlockKey(false);
    setPhase('setup-needed');
  }, [userId]);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await securityApi.status();
      setHasUnlockKey(status.hasUnlockKey);
      if (status.hasUnlockKey && !wrapper) {
        const stored = await keysApi.get();
        setWrapper(stored);
      }
    } catch {
      // keep current phase
    }
  }, [wrapper]);

  const value = useMemo<VaultContextValue>(
    () => ({
      phase,
      userId: userId ?? null,
      wrapper,
      hasUnlockKey,
      autoLock,
      setAutoLock,
      lastUnlockedAt,
      setupVault,
      unlock,
      changePin,
      resetVault,
      lock,
      refreshStatus,
    }),
    [
      phase,
      userId,
      wrapper,
      hasUnlockKey,
      autoLock,
      setAutoLock,
      lastUnlockedAt,
      setupVault,
      unlock,
      changePin,
      resetVault,
      lock,
      refreshStatus,
    ],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}