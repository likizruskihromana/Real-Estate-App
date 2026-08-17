import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bath, BedDouble, Building, CalendarDays, ChevronLeft, HandCoins, Heart, MapPin, Maximize2, MessageSquareText, ShieldCheck, Share2, Sparkles, X } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { api, imageUrl, money } from '../lib/api';
import type { Nekretnina } from '../types';
import { useAuth } from '../auth/AuthContext';
import { PropertyCard } from '../components/PropertyCard';

type Action = 'message' | 'appointment' | 'offer' | null;

export function PropertyDetailPage() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [action, setAction] = useState<Action>(null);
  const query = useQuery({
    queryKey: ['property', slug],
    queryFn: async () => {
      try { return await api<Nekretnina>(`/api/v2/nekretnine/${slug}`); }
      catch (error) { if (/^\d+$/.test(slug)) return api<Nekretnina>(`/api/nekretnine/${slug}`); throw error; }
    },
  });
  const similar = useQuery({ queryKey: ['similar', slug], queryFn: () => api<Nekretnina[]>(`/api/v2/nekretnine/${slug}/slicne`), enabled: !!query.data, retry: false });
  if (query.isLoading) return <div className="container page"><div className="skeleton detail-skeleton" /></div>;
  if (!query.data) return <div className="container page empty-state"><h1>Oglas nije pronađen</h1><Link className="button" to="/nekretnine">Nazad na pretragu</Link></div>;
  const item = query.data;
  const closed = item.kupljeno || ['SOLD', 'RENTED', 'ARCHIVED'].includes(item.status || '');
  const photos = item.Slike?.length ? item.Slike : [{ id: 0, url: '/resources/stan1.jpg' }];
  const requireLogin = (next: Exclude<Action, null>) => user ? setAction(next) : navigate(`/prijava?next=${encodeURIComponent(location.pathname)}`);

  return <>
    <div className="container detail-page">
      <div className="detail-topbar"><Link to="/nekretnine"><ChevronLeft /> Nazad na rezultate</Link><div><button className="icon-text"><Share2/> Podijeli</button><button className="icon-text"><Heart/> Sačuvaj</button></div></div>
      <div className="gallery">
        <img className="gallery-main" src={imageUrl(photos[0])} alt={photos[0].altTekst || item.naziv}/>
        {photos.slice(1,3).map(photo => <img key={photo.id} src={imageUrl(photo)} alt={photo.altTekst || item.naziv}/>) }
        <button className="gallery-count"><Maximize2/> Sve fotografije ({photos.length})</button>
      </div>
      <div className="detail-grid">
        <article className="detail-content">
          <div className="detail-heading">
            <div><span className="pill">{item.tip_nekretnine}</span><span className="status-dot">{labelStatus(item.status, item.kupljeno)}</span><h1>{item.naziv}</h1><p><MapPin/> {item.lokacija}</p></div>
            <div className="detail-price"><strong>{money(item.cijena)}</strong><span>{Math.round(Number(item.cijena) / item.kvadratura).toLocaleString('bs-BA')} KM / m²</span></div>
          </div>
          <div className="facts-strip"><Fact icon={<Maximize2/>} value={`${item.kvadratura} m²`} label="Površina"/><Fact icon={<BedDouble/>} value={String(item.brojSoba || '—')} label="Sobe"/><Fact icon={<Bath/>} value={String(item.brojKupatila || '—')} label="Kupatila"/><Fact icon={<Building/>} value={item.sprat != null ? `${item.sprat}.` : '—'} label="Sprat"/></div>
          <Section title="O nekretnini"><p className="lead-copy">{item.opis || 'Pažljivo predstavljena nekretnina na odličnoj lokaciji. Kontaktirajte vlasnika ili agenta za dodatne informacije.'}</p></Section>
          <Section title="Ključne informacije"><div className="info-grid"><Info label="Godina izgradnje" value={item.godina_izgradnje || 'Nije navedeno'}/><Info label="Grijanje" value={item.tip_grijanja || 'Nije navedeno'}/><Info label="Energetska klasa" value={item.energetskaKlasa || 'Nije navedeno'}/><Info label="Namjena" value={item.namjena === 'NAJAM' ? 'Najam' : 'Prodaja'}/></div></Section>
          <Section title="Pogodnosti"><div className="amenities">{[['Parking',item.parking],['Balkon',item.balkon],['Lift',item.lift],['Privatna komunikacija',true]].map(([name,on]) => <span className={on ? '' : 'muted'} key={String(name)}><Sparkles/> {name}</span>)}</div></Section>
          <Section title="Lokacija"><div className="location-copy"><div><MapPin/><span><strong>{item.naselje || item.lokacija}</strong><small>Prikazana je približna lokacija radi privatnosti.</small></span></div><span className="privacy-badge"><ShieldCheck/> Zaštićena adresa</span></div><ApproximateMap item={item}/></Section>
          <Section title="Česta pitanja"><Faq propertyId={item.id}/></Section>
        </article>
        <aside className="contact-card">
          <span className="kicker">Zainteresovani ste?</span><h2>Napravite sljedeći korak</h2><p>Sva komunikacija ostaje vezana za ovaj oglas i dostupna u vašem inboxu.</p>
          <button className="button full" disabled={closed} onClick={() => requireLogin('message')}><MessageSquareText/> Pošalji poruku</button>
          <button className="button secondary full" disabled={closed} onClick={() => requireLogin('appointment')}><CalendarDays/> Zakaži pregled</button>
          <button className="button ghost full" disabled={closed} onClick={() => requireLogin('offer')}><HandCoins/> Pošalji ponudu</button>
          {closed && <div className="notice">Ovaj oglas više ne prima nova interesovanja.</div>}
          <div className="seller"><div className="avatar">{item.Organizacija?.naziv?.[0] || item.Korisnik?.username?.[0] || 'D'}</div><div><small>Oglas objavljuje</small><strong>{item.Organizacija?.naziv || item.Korisnik?.username || 'Domus korisnik'}</strong>{item.Organizacija?.verificirana && <span><ShieldCheck/> Verificirana agencija</span>}</div></div>
        </aside>
      </div>
    </div>
    {!!similar.data?.length && <section className="section similar-section"><div className="container"><div className="section-heading"><div><span className="kicker">Možda vam odgovara</span><h2>Slične nekretnine</h2></div></div><div className="card-grid">{similar.data.slice(0,3).map(i => <PropertyCard item={i} key={i.id}/>)}</div></div></section>}
    {action && <ActionDialog action={action} item={item} onClose={() => setAction(null)}/>} 
  </>;
}

function ActionDialog({ action, item, onClose }: { action: Exclude<Action,null>; item: Nekretnina; onClose: () => void }) {
  const client = useQueryClient();
  const mutation = useMutation({ mutationFn: (payload: unknown) => api(action === 'message' ? '/api/v2/razgovori' : action === 'appointment' ? '/api/v2/termini' : '/api/v2/pregovaracke-ponude', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => { client.invalidateQueries({ queryKey: ['notifications'] }); onClose(); } });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const base = { NekretninaId: item.id }; action === 'message' ? mutation.mutate({ ...base, tekst: data.get('tekst') }) : action === 'appointment' ? mutation.mutate({ ...base, termini: data.getAll('termini') }) : mutation.mutate({ ...base, iznos: Number(data.get('iznos')), poruka: data.get('tekst') }); };
  const title = action === 'message' ? 'Pošaljite privatnu poruku' : action === 'appointment' ? 'Predložite termine pregleda' : 'Pošaljite neobavezujuću ponudu';
  return <div className="dialog-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="dialog-close" onClick={onClose} aria-label="Zatvori"><X/></button><span className="kicker">{item.naziv}</span><h2 id="dialog-title">{title}</h2><form onSubmit={submit}>
    {action === 'appointment' ? <>{[1,2,3].map((n) => <label key={n}>Prijedlog {n}<input name="termini" type="datetime-local" required={n === 1}/></label>)}</> : null}
    {action === 'offer' && <label>Iznos ponude (KM)<input name="iznos" type="number" min="1" required/></label>}
    {action !== 'appointment' && <label>{action === 'message' ? 'Vaša poruka' : 'Napomena'}<textarea name="tekst" rows={5} required={action === 'message'} placeholder="Napišite kratku i konkretnu poruku..."/></label>}
    {action === 'offer' && <div className="notice">Ponuda je neobavezujuća i ne predstavlja ugovor niti rezervaciju.</div>}
    {mutation.error && <p className="form-error">{mutation.error.message}</p>}<button className="button full" disabled={mutation.isPending}>{mutation.isPending ? 'Šaljem…' : 'Pošalji'}</button>
  </form></div></div>;
}

function ApproximateMap({ item }: { item: Nekretnina }) { const pos: [number,number] = [item.latPriblizno || 43.8563, item.lngPriblizno || 18.4131]; return <MapContainer className="map" center={pos} zoom={13} scrollWheelZoom={false}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Marker position={pos}/></MapContainer>; }
function Fact({icon,value,label}:{icon:ReactNode;value:string;label:string}) { return <div>{icon}<span><strong>{value}</strong><small>{label}</small></span></div>; }
function Info({label,value}:{label:string;value:string|number}) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function Section({title,children}:{title:string;children:ReactNode}) { return <section className="detail-section"><h2>{title}</h2>{children}</section>; }
function labelStatus(status?: string, bought?: boolean) { if (bought || status === 'SOLD') return 'Prodano'; if (status === 'RENTED') return 'Iznajmljeno'; return 'Aktivan oglas'; }
function Faq({ propertyId }: { propertyId: number }) { const q = useQuery({ queryKey:['faq',propertyId], queryFn:()=>api<{id:number;pitanje:string;odgovor:string}[]>(`/api/v2/nekretnine/${propertyId}/faq`), retry:false }); if (!q.data?.length) return <div className="empty-inline"><MessageSquareText/><div><strong>Još nema javnih pitanja</strong><p>Privatne poruke nisu javne. Vlasnik može anonimizirati koristan odgovor i objaviti ga ovdje.</p></div></div>; return <div className="faq-list">{q.data.map(x=><details key={x.id}><summary>{x.pitanje}</summary><p>{x.odgovor}</p></details>)}</div>; }
