import { ArrowRight, BadgeCheck, BarChart3, Search, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiEnvelope } from '../lib/api';
import type { Nekretnina } from '../types';
import { PropertyCard } from '../components/PropertyCard';

export function HomePage() {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['properties', 'featured'], queryFn: () => apiEnvelope<Nekretnina[]>('/api/v2/nekretnine?pageSize=6&page=1') });
  const items = query.data?.data || [];
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="kicker">Provjereniji put do nekretnine</span>
          <h1>Prostor u kojem počinje <em>sljedeće poglavlje.</em></h1>
          <p>Pronađite dom, razgovarajte direktno s vlasnikom ili agentom i pratite svaki korak na jednom sigurnom mjestu.</p>
          <form className="search-bar" onSubmit={(e) => { e.preventDefault(); navigate(`/nekretnine?lokacija=${encodeURIComponent(location)}`); }}>
            <Search aria-hidden="true" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Grad, naselje ili ulica" aria-label="Lokacija" />
            <button className="button" type="submit">Pretraži</button>
          </form>
          <div className="trust-row"><span><ShieldCheck /> Oglasi na provjeri</span><span><BadgeCheck /> Verificirane agencije</span><span><BarChart3 /> Jasna historija aktivnosti</span></div>
        </div>
        <div className="hero-visual">
          <img src="/resources/stan1.jpg" alt="Moderan i svijetao stan" />
          <div className="hero-note"><span>Nova prilika</span><strong>Sarajevo, Centar</strong><small>Od 245.000 KM</small></div>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <div className="section-heading"><div><span className="kicker">Izdvojeno</span><h2>Nekretnine vrijedne pažnje</h2></div><Link className="text-link" to="/nekretnine">Pogledaj sve <ArrowRight /></Link></div>
        {query.isLoading ? <div className="card-grid">{[1,2,3].map(i => <div className="skeleton card-skeleton" key={i} />)}</div> :
          items.length ? <div className="card-grid">{items.slice(0, 6).map(item => <PropertyCard item={item} key={item.id} />)}</div> : <Empty title="Novi oglasi uskoro" />}
      </div>
    </section>
    <section className="how-section"><div className="container"><span className="kicker">Jednostavan proces</span><h2>Od pretrage do dogovora, bez nejasnoća</h2><div className="steps"><Step n="01" title="Pronađite" text="Pametni filteri, sačuvane pretrage i relevantne preporuke."/><Step n="02" title="Razgovarajte" text="Privatan inbox čuva sva pitanja i odgovore uz konkretan oglas."/><Step n="03" title="Dogovorite" text="Predložite termin ili pošaljite neobavezujuću ponudu."/></div></div></section>
  </>;
}

function Step({ n, title, text }: { n: string; title: string; text: string }) { return <div className="step"><span>{n}</span><h3>{title}</h3><p>{text}</p></div>; }
function Empty({ title }: { title: string }) { return <div className="empty-state"><h3>{title}</h3><p>Trenutno nema sadržaja za prikaz.</p></div>; }
