import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Nekretnina } from '../types';
import { PropertyCard } from '../components/PropertyCard';

export function ListingsPage() {
  const [params, setParams] = useSearchParams();
  const location = params.get('lokacija') || '';
  const query = useQuery({ queryKey: ['properties', params.toString()], queryFn: () => api<Nekretnina[] | { items: Nekretnina[]; pagination?: { totalItems: number } }>(`/api/nekretnine?limit=24&page=1`) });
  const all = Array.isArray(query.data) ? query.data : query.data?.items || [];
  const items = all.filter(item => !location || item.lokacija.toLowerCase().includes(location.toLowerCase()));
  return <div className="page container">
    <div className="page-heading"><div><span className="kicker">Istražite ponudu</span><h1>Nekretnine</h1><p>{items.length || '—'} oglasa odgovara vašoj pretrazi</p></div><button className="button secondary"><SlidersHorizontal /> Sačuvaj pretragu</button></div>
    <div className="listing-toolbar">
      <label className="search-field"><Search /><input value={location} onChange={e => { const next = new URLSearchParams(params); e.target.value ? next.set('lokacija', e.target.value) : next.delete('lokacija'); setParams(next); }} placeholder="Lokacija" /></label>
      <select aria-label="Tip nekretnine"><option>Svi tipovi</option><option>Stan</option><option>Kuća</option><option>Poslovni prostor</option></select>
      <select aria-label="Namjena"><option>Prodaja i najam</option><option>Prodaja</option><option>Najam</option></select>
      <select aria-label="Cijena"><option>Sve cijene</option><option>Do 150.000 KM</option><option>Do 300.000 KM</option></select>
      <button className="button ghost"><Filter /> Više filtera</button>
    </div>
    {query.isLoading ? <div className="card-grid">{[1,2,3,4,5,6].map(i => <div className="skeleton card-skeleton" key={i}/>)}</div> : items.length ? <div className="card-grid">{items.map(item => <PropertyCard key={item.id} item={item}/>)}</div> : <div className="empty-state"><h2>Nema rezultata</h2><p>Pokušajte promijeniti lokaciju ili ukloniti neki filter.</p></div>}
  </div>;
}
