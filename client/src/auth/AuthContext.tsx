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
    source.addEventListener('notification', () => client.invalidateQueries({ queryKey: ['notifications'] }));
    return () => source.close();
  }, [client, query.data?.korisnik]);
  return <AuthContext.Provider value={{ user: query.data?.korisnik ?? null, loading: query.isLoading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
