import { Bell, Building2, Heart, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BetaTools } from './BetaTools';

export function Layout() {
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const { user, logout, loggingOut } = useAuth();
  const navigate = useNavigate();
  const admin = user && user.systemRole !== 'USER';
  const signOut = async () => { try { setLogoutError(false); await logout(); setOpen(false); navigate('/', { replace: true }); } catch { setLogoutError(true); } };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/" aria-label="Domus početna">
            <span className="brand-mark"><Building2 size={22} /></span>
            <span>DOMUS</span>
          </Link>
          <button className="icon-button nav-toggle" onClick={() => setOpen(!open)} aria-label="Otvori navigaciju">
            {open ? <X /> : <Menu />}
          </button>
          <nav className={open ? 'main-nav is-open' : 'main-nav'} onClick={() => setOpen(false)}>
            <NavLink to="/nekretnine">Nekretnine</NavLink>
            <NavLink to="/agencije">Agencije</NavLink>
            <NavLink to="/uporedi">Uporedi</NavLink>
            {user && <NavLink to="/inbox">Inbox</NavLink>}
            {user && <NavLink to="/moji-oglasi">Moji oglasi</NavLink>}
            {admin && <NavLink to="/admin">Admin centar</NavLink>}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link className="icon-button" to="/sacuvano" aria-label="Sačuvano"><Heart size={19} /></Link>
                <Link className="icon-button notification-button" to="/obavijesti" aria-label="Obavijesti"><Bell size={19} /><span /></Link>
                <Link className="user-chip" to="/profil"><UserRound size={18} /><span>{user.ime}</span></Link>
                <button className="logout-button" type="button" onClick={signOut} disabled={loggingOut} aria-label={logoutError ? 'Odjava nije uspjela, pokušaj ponovo' : 'Odjavi se'}><LogOut size={18} /><span>{loggingOut ? 'Odjavljujem…' : logoutError ? 'Pokušaj ponovo' : 'Odjavi se'}</span></button>
              </>
            ) : (
              <><Link className="link-button" to="/prijava">Prijavi se</Link><Link className="button small" to="/registracija">Registruj se</Link></>
            )}
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div><div className="brand light"><Building2 size={21} /> DOMUS</div><p>Više jasnoće, sigurnosti i povjerenja pri svakom koraku do novog doma.</p></div>
          <div><strong>Istraži</strong><Link to="/nekretnine">Nekretnine</Link><Link to="/agencije">Agencije</Link><Link to="/sacuvano">Sačuvano</Link></div>
          <div><strong>Podrška</strong><span>Sigurna komunikacija</span><span>Provjereni oglasi</span><span>Privatnost lokacije</span></div>
        </div>
      </footer>
      <BetaTools />
    </div>
  );
}
