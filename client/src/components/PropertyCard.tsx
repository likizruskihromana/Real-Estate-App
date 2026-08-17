import { Bath, BedDouble, Heart, MapPin, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, ApiError, imageUrl, money } from '../lib/api';
import type { Nekretnina } from '../types';

export function PropertyCard({ item }: { item: Nekretnina }) {
  const link = `/nekretnine/${item.slug || item.id}`;
  const [saved,setSaved]=useState(false);
  const save=async()=>{try{await api(`/api/sacuvano/omiljene/${item.id}`,{method:'POST'});setSaved(true)}catch(error){if(error instanceof ApiError&&error.status===401)location.assign(`/prijava?next=${encodeURIComponent(location.pathname)}`)}};
  return (
    <article className="property-card">
      <div className="property-image-wrap">
        <Link to={link}><img src={imageUrl(item.Slike?.[0])} alt={item.Slike?.[0]?.altTekst || item.naziv} loading="lazy" /></Link>
        <span className="pill overlay">{item.namjena === 'NAJAM' ? 'Iznajmljivanje' : 'Prodaja'}</span>
        <button className={saved?'floating-heart saved':'floating-heart'} aria-label="Sačuvaj oglas" onClick={save}><Heart size={19} fill={saved?'currentColor':'none'} /></button>
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
