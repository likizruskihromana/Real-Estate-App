(function () {
    const mount = document.getElementById('site-header');
    if (!mount) return;

    const page = window.location.pathname.split('/').pop() || 'index.html';
    const active = (file) => page === file ? ' aria-current="page"' : '';
    mount.className = 'site-header';
    mount.innerHTML = `
        <div class="site-header__inner shell">
            <a class="brand" href="index.html" aria-label="Domus početna">
                <span class="brand__mark" aria-hidden="true">D</span><span>Domus</span>
            </a>
            <button class="menu-toggle" type="button" aria-label="Otvori navigaciju" aria-expanded="false">☰</button>
            <nav class="site-nav" aria-label="Glavna navigacija">
                <a href="nekretnine.html"${active('nekretnine.html')}>Nekretnine</a>
                <a href="arhiva.html"${active('arhiva.html')}>Prodane</a>
                <a href="sacuvano.html" data-auth-only hidden${active('sacuvano.html')}>Sačuvano</a>
                <a href="statistika.html" data-auth-only hidden${active('statistika.html')}>Analitika</a>
                <a href="mojiUpiti.html" data-auth-only hidden${active('mojiUpiti.html')}>Aktivnosti</a>
                <a href="profil.html" data-auth-only hidden${active('profil.html')}>Profil</a>
                <a href="admin.html" data-admin-only hidden${active('admin.html')}>Admin</a>
                <button type="button" data-auth-only data-logout hidden>Odjava</button>
                <a class="nav-cta" href="prijava.html" data-guest-only${active('prijava.html')}>Prijava</a>
            </nav>
        </div>`;

    const nav = mount.querySelector('.site-nav');
    const toggle = mount.querySelector('.menu-toggle');
    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Zatvori navigaciju' : 'Otvori navigaciju');
        toggle.textContent = open ? '×' : '☰';
        document.body.classList.toggle('menu-open', open);
    });

    PoziviAjax.getKorisnik((err, user) => {
        const logged = !err && user && user.username;
        mount.querySelectorAll('[data-auth-only]').forEach((element) => { element.hidden = !logged; });
        mount.querySelectorAll('[data-guest-only]').forEach((element) => { element.hidden = !!logged; });
        mount.querySelectorAll('[data-admin-only]').forEach((element) => { element.hidden = !(logged && user.admin); });
    });

    mount.querySelector('[data-logout]').addEventListener('click', () => {
        PoziviAjax.postLogout((err) => {
            if (err) return window.alert(err.statusText || 'Odjava trenutno nije dostupna.');
            window.location.href = 'index.html';
        });
    });
}());
