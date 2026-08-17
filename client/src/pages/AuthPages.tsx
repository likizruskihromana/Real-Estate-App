import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../lib/api';

const loginSchema = z.object({ identitet: z.string().min(3, 'Unesite username ili email.'), password: z.string().min(6, 'Lozinka ima najmanje 6 znakova.') });
const registerSchema = z.object({ ime:z.string().min(2), prezime:z.string().min(2), username:z.string().min(3), email:z.string().email('Unesite ispravan email.'), password:z.string().min(8,'Koristite najmanje 8 znakova.') });

export function LoginPage() {
  const form = useForm<z.infer<typeof loginSchema>>({ resolver:zodResolver(loginSchema) }); const nav=useNavigate(); const location=useLocation(); const client=useQueryClient();
  const mutation=useMutation({mutationFn:(v:z.infer<typeof loginSchema>)=>api('/api/v2/auth/login',{method:'POST',body:JSON.stringify(v)}),onSuccess:async()=>{await client.invalidateQueries({queryKey:['session']});nav(new URLSearchParams(location.search).get('next')||'/');}});
  return <AuthShell title="Dobro došli nazad" subtitle="Nastavite tamo gdje ste stali."><form onSubmit={form.handleSubmit(v=>mutation.mutate(v))}><Field label="Username ili email" error={form.formState.errors.identitet?.message}><input autoComplete="username" {...form.register('identitet')}/></Field><Field label="Lozinka" error={form.formState.errors.password?.message}><input type="password" autoComplete="current-password" {...form.register('password')}/></Field>{mutation.error&&<p className="form-error">{mutation.error.message}</p>}<button className="button full">Prijavi se <ArrowRight/></button><p className="auth-switch">Nemate nalog? <Link to="/registracija">Registrujte se</Link></p></form></AuthShell>;
}
export function RegisterPage() {
  const form=useForm<z.infer<typeof registerSchema>>({resolver:zodResolver(registerSchema)}); const nav=useNavigate();
  const mutation=useMutation({mutationFn:(v:z.infer<typeof registerSchema>)=>api('/api/v2/auth/register',{method:'POST',body:JSON.stringify(v)}),onSuccess:()=>nav('/profil?verify=1')});
  return <AuthShell title="Kreirajte Domus nalog" subtitle="Jedan nalog za pretragu, razgovore i oglase."><form onSubmit={form.handleSubmit(v=>mutation.mutate(v))}><div className="form-two"><Field label="Ime"><input {...form.register('ime')}/></Field><Field label="Prezime"><input {...form.register('prezime')}/></Field></div><Field label="Username"><input autoComplete="username" {...form.register('username')}/></Field><Field label="Email" error={form.formState.errors.email?.message}><input type="email" autoComplete="email" {...form.register('email')}/></Field><Field label="Lozinka" error={form.formState.errors.password?.message}><input type="password" autoComplete="new-password" {...form.register('password')}/></Field>{mutation.error&&<p className="form-error">{mutation.error.message}</p>}<button className="button full">Kreiraj nalog <ArrowRight/></button><p className="auth-switch">Već imate nalog? <Link to="/prijava">Prijavite se</Link></p></form></AuthShell>;
}
function AuthShell({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}) { return <div className="auth-page"><div className="auth-panel"><Link className="brand" to="/"><Building2/> DOMUS</Link><span className="kicker">Siguran pristup</span><h1>{title}</h1><p>{subtitle}</p>{children}<div className="auth-trust"><ShieldCheck/> Vaši razgovori i ponude ostaju privatni.</div></div><div className="auth-image"><img src="/resources/stan1.jpg" alt="Domus nekretnina"/><blockquote>“Dom nije samo adresa. To je osjećaj da ste stigli na pravo mjesto.”</blockquote></div></div>; }
import type { ReactNode } from 'react';
function Field({label,error,children}:{label:string;error?:string;children:ReactNode}) { return <label>{label}{children}{error&&<small className="field-error">{error}</small>}</label>; }
