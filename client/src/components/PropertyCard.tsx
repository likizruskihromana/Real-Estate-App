import { Bath, BedDouble, Heart, MapPin, MoveUpRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, imageUrl, money } from '../lib/api';
import type { FavoritesPayload, Nekretnina } from '../types';
import { useAuth } from '../auth/AuthContext';

export function PropertyCard({ item }: { item: Nekretnina }) {
  const link = `/nekretnine/${item.slug || item.id}`;
  const { user } = useAuth(); const client=useQueryClient(); const navigate=useNavigate(); const location=useLocation();
  const favorites=useQuery({queryKey:['favorites'],queryFn:()=>api<FavoritesPayload>('/api/v2/omiljene'),enabled:!!user,staleTime:30000});
  const saved=!!favorites.data?.ids.includes(item.id);
  const toggle=useMutation({mutationFn:()=>api(`/api/v2/omiljene/${item.id}`,{method:saved?'DELETE':'POST'}),onMutate:async()=>{await client.cancelQueries({queryKey:['favorites']});const previous=client.getQueryData<FavoritesPayload>(['favorites']);if(previous)client.setQueryData<FavoritesPayload>(['favorites'],{...previous,ids:saved?previous.ids.filter(id=>id!==item.id):[...previous.ids,item.id],items:saved?previous.items.filter(x=>x.id!==item.id):[item,...previous.items]});return{previous}},onError:(_e,_v,ctx)=>ctx?.previous&&client.setQueryData(['favorites'],ctx.previous),onSettled:()=>client.invalidateQueries({queryKey:['favorites']})});
  const save=()=>user?toggle.mutate():navigate(`/prijava?next=${encodeURIComponent(location.pathname+location.search)}`);
  return (
    <article className="property-card">
      <div className="property-image-wrap">
        <Link to={link}><img src={imageUrl(item.Slike?.[0],'thumbnail')} srcSet={item.Slike?.[0]?.mediumUrl?`${imageUrl(item.Slike[0],'thumbnail')} 480w, ${imageUrl(item.Slike[0],'medium')} 960w`:undefined} sizes="(max-width: 700px) 100vw, 33vw" alt={item.Slike?.[0]?.altTekst || item.naziv} loading="lazy" width="480" height="320" /></Link>
        <span className="pill overlay">{item.namjena === 'NAJAM' ? 'Iznajmljivanje' : 'Prodaja'}</span>
        <button className={saved?'floating-heart saved':'floating-heart'} aria-label={saved?'Ukloni iz sačuvanih':'Sačuvaj oglas'} aria-pressed={saved} disabled={toggle.isPending} onClick={save}><Heart size={19} fill={saved?'currentColor':'none'} /></button>
      </div>
      <div className="property-card-body">
        <div className="eyebrow"><MapPin size={14} /> {item.lokacija}</div>
        <h3><Link to={link}>{item.naziv}</Link></h3>
        <div className="feature-row">
          <span>{item.kvadratura} m²</span>
          {item.brojSoba ? <span><BedDouble size={16} /> {item.brojSoba}</span> : null}
          {item.brojKupatila ? <span><Bath size={16} /> {item.brojKupatila}</span> : null}
        </div>
        <div className="card-price"><strong>{money(item.cijena)}</strong><Link to={link} aria-label="Otvori detalje"><MoveUpRight size={20} /></Link></div>
      </div>
    </article>
  );
}
