import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

export function CategoryLandingPage({kind}:{kind:'grad'|'tip'}){const params=useParams(),navigate=useNavigate(),value=params[kind]||'';useEffect(()=>{const query=kind==='grad'?`lokacija=${encodeURIComponent(value.replace(/-/g,' '))}`:`tip=${encodeURIComponent(value.replace(/-/g,' '))}`;navigate(`/nekretnine?${query}`,{replace:true})},[kind,value,navigate]);return <div className="container page"><div className="skeleton detail-skeleton"/></div>}
export function GuidePage(){const {slug}=useParams();const query=useQuery({queryKey:['guide',slug],queryFn:()=>api<any>(`/api/v2/vodici/${slug}`)});if(query.isLoading)return <div className="container page"><div className="skeleton detail-skeleton"/></div>;if(!query.data)return <div className="container page empty-state"><h1>Vodič nije pronađen</h1><Link className="button" to="/">Početna</Link></div>;return <article className="container page guide-page"><span className="kicker">Domus vodič</span><h1>{query.data.naslov}</h1><p className="guide-lead">{query.data.sazetak}</p><div className="guide-content">{String(query.data.sadrzaj).split(/\n{2,}/).map((p:string,i:number)=><p key={i}>{p}</p>)}</div></article>}
