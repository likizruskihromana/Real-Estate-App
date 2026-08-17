function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}
import { track } from './observability';

function trackRequest(path:string,method:string){if(path.startsWith('/api/v2/nekretnine?'))track('search_completed',{has_filters:path.includes('=')});else if(path.includes('/omiljene/')&&method==='POST')track('listing_favorited');else if(path.endsWith('/razgovori')&&method==='POST')track('conversation_started');else if(path.endsWith('/termini')&&method==='POST')track('appointment_requested');else if(path.endsWith('/pregovori')&&method==='POST')track('offer_submitted');else if(path.endsWith('/submit')&&method==='POST')track('listing_submitted')}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public fieldErrors?: Record<string,string>) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('content-type', 'application/json');
  const token = readCookie('nekretnine.csrf');
  if (token && !['GET', 'HEAD'].includes(init.method || 'GET')) headers.set('x-csrf-token', decodeURIComponent(token));

  const response = await fetch(path, { ...init, headers, credentials: 'include' });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message || body?.greska || 'Zahtjev nije uspio.';
    throw new ApiError(response.status, message, body?.error?.code, body?.error?.fieldErrors);
  }
  trackRequest(path,init.method||'GET');
  return (body?.data ?? body) as T;
}

export async function apiEnvelope<T, M = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<{ data: T; meta: M }> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('content-type', 'application/json');
  const token = readCookie('nekretnine.csrf');
  if (token && !['GET', 'HEAD'].includes(init.method || 'GET')) headers.set('x-csrf-token', decodeURIComponent(token));
  const response = await fetch(path, { ...init, headers, credentials: 'include' });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, body?.error?.message || body?.greska || 'Zahtjev nije uspio.', body?.error?.code, body?.error?.fieldErrors);
  trackRequest(path,init.method||'GET');
  return { data: body?.data as T, meta: (body?.meta || {}) as M };
}

export const money = (value: number | string) =>
  new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM', maximumFractionDigits: 0 }).format(Number(value));

export const imageUrl = (slika?: { url?: string; mediumUrl?: string; largeUrl?: string; thumbnailUrl?: string; filename?: string }, size: 'thumbnail'|'medium'|'large' = 'medium') =>
  (size === 'thumbnail' ? slika?.thumbnailUrl : size === 'large' ? slika?.largeUrl : slika?.mediumUrl) || slika?.url || (slika?.filename ? `/uploads/${slika.filename}` : '/resources/stan1.jpg');
