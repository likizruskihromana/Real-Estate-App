import { createContext, useContext, useEffect, type PropsWithChildren } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SessionUser } from '../types';

type AuthState = { user: SessionUser | null; loading: boolean };
const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['session'],
    queryFn: () => api<{ korisnik: SessionUser | null }>('/api/v2/auth/session'),
    retry: false,
  });
  useEffect(() => {
    if (!query.data?.korisnik) return;
    const source = new EventSource('/api/v2/obavijesti/stream', { withCredentials: true });
    const refreshLiveData = () => {
      client.invalidateQueries({ queryKey: ['notifications'] });
      client.invalidateQueries({ queryKey: ['conversations'] });
      client.invalidateQueries({ queryKey: ['conversation'] });
    };
    source.addEventListener('notification', refreshLiveData);
    let fallback: number | undefined;
    source.onerror = () => { source.close(); if (!fallback) fallback = window.setInterval(refreshLiveData, 30_000); };
    return () => { source.close(); if (fallback) window.clearInterval(fallback); };
  }, [client, query.data?.korisnik]);
  return <AuthContext.Provider value={{ user: query.data?.korisnik ?? null, loading: query.isLoading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
