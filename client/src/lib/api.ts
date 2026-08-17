function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
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
    throw new ApiError(response.status, message, body?.error?.code);
  }
  return (body?.data ?? body) as T;
}

export const money = (value: number | string) =>
  new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM', maximumFractionDigits: 0 }).format(Number(value));

export const imageUrl = (slika?: { url?: string; filename?: string }) =>
  slika?.url || (slika?.filename ? `/uploads/${slika.filename}` : '/resources/stan1.jpg');
