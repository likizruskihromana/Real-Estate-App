export type SystemRole = 'USER' | 'ANALYST' | 'MODERATOR' | 'SUPER_ADMIN';
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED' | 'SOLD' | 'RENTED';

export interface Slika {
  id: number;
  url?: string;
  filename?: string;
  glavna?: boolean;
  altTekst?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  sirina?: number;
  visina?: number;
}

export interface Nekretnina {
  id: number;
  slug?: string;
  naziv: string;
  tip_nekretnine: string;
  namjena?: 'PRODAJA' | 'NAJAM';
  status?: ListingStatus;
  kvadratura: number;
  cijena: number | string;
  lokacija: string;
  grad?: string;
  naselje?: string;
  opis?: string;
  tip_grijanja?: string;
  godina_izgradnje?: number;
  brojSoba?: number;
  brojKupatila?: number;
  sprat?: number;
  parking?: boolean;
  balkon?: boolean;
  lift?: boolean;
  energetskaKlasa?: string;
  namjestenost?: string;
  stanje?: string;
  dostupnoOd?: string;
  pogodnosti?: string[];
  kupljeno?: boolean;
  latPriblizno?: number;
  lngPriblizno?: number;
  Slike?: Slika[];
  Korisnik?: { id: number; ime?: string; prezime?: string; username: string };
  Organizacija?: { id: number; naziv: string; slug: string; verificirana?: boolean };
}

export interface SearchCriteria {
  lokacija?: string; tip?: string; namjena?: 'PRODAJA'|'NAJAM'; cijenaMin?: number; cijenaMax?: number;
  kvadraturaMin?: number; kvadraturaMax?: number; sobeMin?: number; kupatilaMin?: number;
  parking?: boolean; balkon?: boolean; lift?: boolean; namjestenost?: string; stanje?: string;
  energetskaKlasa?: string; dostupnoOd?: string; sort?: 'najnovije'|'cijena-asc'|'cijena-desc'|'kvadratura-desc';
}

export interface SavedSearch { id:number; naziv:string; kriteriji:SearchCriteria; alertsEnabled:boolean; createdAt:string; }
export interface FavoritesPayload { ids:number[]; items:Nekretnina[]; }

export interface SessionUser {
  id: number;
  ime: string;
  prezime: string;
  username: string;
  email?: string;
  emailVerified?: boolean;
  systemRole: SystemRole;
}

export interface Conversation {
  id: number;
  status: 'OPEN' | 'CLOSED' | 'BLOCKED';
  Nekretnina: Pick<Nekretnina, 'id' | 'naziv' | 'lokacija'>;
  drugaStrana?: { id: number; naziv: string };
  zadnjaPoruka?: string;
  neprocitano?: number;
  updatedAt: string;
}

export interface Notification {
  id: number;
  tip: string;
  naslov: string;
  poruka: string;
  link?: string;
  procitanoAt?: string;
  createdAt: string;
}
