let trenutniKorisnik = null;

window.addEventListener('DOMContentLoaded', () => {
    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err || !korisnik || !korisnik.admin) {
            window.location.href = './index.html';
            return;
        }
        trenutniKorisnik = korisnik;
        setupTabovi();
        ucitajDashboard();
        ucitajKorisnike();
        ucitajNekretnine();
        ucitajZahtjeve();
        ucitajPonude();
        ucitajKomentare();
    });
});

function setupTabovi() {
    document.querySelectorAll('.tab-dugme').forEach(dugme => {
        dugme.addEventListener('click', () => {
            document.querySelectorAll('.tab-dugme').forEach(d => d.classList.remove('aktivan'));
            document.querySelectorAll('.tab-sadrzaj').forEach(t => t.classList.remove('aktivan'));
            dugme.classList.add('aktivan');
            document.getElementById(`tab-${dugme.dataset.tab}`).classList.add('aktivan');
        });
    });
}

// ==== DASHBOARD ====
function ucitajDashboard() {
    PoziviAjax.getAdminDashboard((err, data) => {
        if (err || !data) return;
        document.getElementById('dashboard-kartice').innerHTML = `
            <div class="dash-kartica">
                <span class="dash-broj">${data.brojKorisnika}</span>
                <span class="dash-labela">Korisnika</span>
            </div>
            <div class="dash-kartica">
                <span class="dash-broj">${data.brojAdmina}</span>
                <span class="dash-labela">Administratora</span>
            </div>
            <div class="dash-kartica zelena">
                <span class="dash-broj">${data.brojAktivnih}</span>
                <span class="dash-labela">Aktivnih oglasa</span>
            </div>
            <div class="dash-kartica crvena">
                <span class="dash-broj">${data.brojProdanih}</span>
                <span class="dash-labela">Prodanih nekretnina</span>
            </div>
            <div class="dash-kartica narandzasta">
                <span class="dash-broj">${data.brojZahtjevaNaCekanju}</span>
                <span class="dash-labela">Zahtjeva na čekanju</span>
            </div>
            <div class="dash-kartica">
                <span class="dash-broj">${data.brojKomentara}</span>
                <span class="dash-labela">Komentara</span>
            </div>
        `;
    });
}

// ==== KORISNICI ====
function ucitajKorisnike() {
    const container = document.getElementById('korisnici-tabela');
    container.innerHTML = '<div class="loading">Učitavanje...</div>';

    PoziviAjax.getAdminKorisnici((err, korisnici) => {
        if (err) { container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška.'}</div>`; return; }

        container.innerHTML = `
            <table class="admin-tabela">
                <thead><tr><th>ID</th><th>Ime</th><th>Username</th><th>Status</th><th>Akcije</th></tr></thead>
                <tbody>
                    ${korisnici.map(k => `
                        <tr>
                            <td>${k.id}</td>
                            <td>${k.ime} ${k.prezime}</td>
                            <td>@${k.username}</td>
                            <td>${k.admin ? '<span class="oznaka oznaka-admin">Admin</span>' : '<span class="oznaka">Korisnik</span>'}</td>
                            <td class="kolona-akcije">
                                ${k.id === trenutniKorisnik.id ? '<span class="napomena">(vi)</span>' : `
                                    <button type="button" class="dugme-sekundarno" data-akcija="toggle-admin" data-id="${k.id}" data-admin="${k.admin}">
                                        ${k.admin ? 'Ukloni admin' : 'Postavi admina'}
                                    </button>
                                    <button type="button" class="dugme-opasnost" data-akcija="obrisi-korisnika" data-id="${k.id}">Obriši</button>
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('[data-akcija="toggle-admin"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const trenutnoAdmin = btn.dataset.admin === 'true';
                PoziviAjax.patchAdminStatus(btn.dataset.id, !trenutnoAdmin, (err) => {
                    if (err) { alert(err.statusText || 'Greška.'); return; }
                    ucitajKorisnike(); ucitajDashboard();
                });
            });
        });

        container.querySelectorAll('[data-akcija="obrisi-korisnika"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('Obrisati korisnika?')) return;
                PoziviAjax.deleteAdminKorisnik(btn.dataset.id, (err) => {
                    if (err) { alert(err.statusText || 'Greška.'); return; }
                    ucitajKorisnike(); ucitajDashboard();
                });
            });
        });
    });
}

// ==== NEKRETNINE ====
function ucitajNekretnine() {
    const container = document.getElementById('nekretnine-tabela');
    container.innerHTML = '<div class="loading">Učitavanje...</div>';

    PoziviAjax.getAdminNekretnine((err, nekretnine) => {
        if (err) { container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška.'}</div>`; return; }

        container.innerHTML = `
            <table class="admin-tabela">
                <thead><tr><th>ID</th><th>Naziv</th><th>Tip</th><th>Cijena</th><th>Vlasnik</th><th>Status</th><th>Akcije</th></tr></thead>
                <tbody>
                    ${nekretnine.map(n => `
                        <tr>
                            <td>${n.id}</td>
                            <td>${n.naziv}</td>
                            <td>${n.tip_nekretnine}</td>
                            <td>${Helpers.formatPrice(n.cijena)}</td>
                            <td>${n.Korisnik ? '@' + n.Korisnik.username : '—'}</td>
                            <td>${n.kupljeno ? '<span class="oznaka oznaka-prodano-mala">Prodano</span>' : '<span class="oznaka">Aktivno</span>'}</td>
                            <td class="kolona-akcije">
                                <a href="detalji.html?id=${n.id}" class="dugme-sekundarno" target="_top">Pogledaj</a>
                                <button type="button" class="dugme-opasnost" data-akcija="obrisi-nekretninu" data-id="${n.id}">Obriši</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('[data-akcija="obrisi-nekretninu"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('Obrisati nekretninu i sve vezane podatke?')) return;
                PoziviAjax.deleteNekretnina(btn.dataset.id, (err) => {
                    if (err) { alert(err.statusText || 'Greška.'); return; }
                    ucitajNekretnine(); ucitajDashboard();
                });
            });
        });
    });
}

// ==== ZAHTJEVI ====
function ucitajZahtjeve() {
    const container = document.getElementById('zahtjevi-tabela');
    container.innerHTML = '<div class="loading">Učitavanje...</div>';

    PoziviAjax.getAdminZahtjevi((err, zahtjevi) => {
        if (err) { container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška.'}</div>`; return; }

        container.innerHTML = `
            <table class="admin-tabela">
                <thead><tr><th>ID</th><th>Nekretnina</th><th>Korisnik</th><th>Datum</th><th>Status</th><th>Akcije</th></tr></thead>
                <tbody>
                    ${zahtjevi.map(z => `
                        <tr>
                            <td>${z.id}</td>
                            <td>${z.Nekretnina ? z.Nekretnina.naziv : '—'}</td>
                            <td>${z.Korisnik ? '@' + z.Korisnik.username : '—'}</td>
                            <td>${Helpers.formatDate(z.trazeniDatum)}</td>
                            <td>${z.odobren ? '<span class="oznaka oznaka-admin">Odobren</span>' : '<span class="oznaka">Na čekanju</span>'}</td>
                            <td class="kolona-akcije">
                                ${!z.odobren ? `<button type="button" class="dugme-sekundarno" data-akcija="odobri" data-id="${z.id}" data-nid="${z.NekretninaId}">Odobri</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('[data-akcija="odobri"]').forEach(btn => {
            btn.addEventListener('click', () => {
                PoziviAjax.putNekretninaZahtjevZid(btn.dataset.nid, btn.dataset.id, { odobren: true }, (err) => {
                    if (err) { alert(err.statusText || 'Greška.'); return; }
                    ucitajZahtjeve(); ucitajDashboard();
                });
            });
        });
    });
}

// ==== PONUDE ====
function ucitajPonude() {
    const container = document.getElementById('ponude-tabela');
    container.innerHTML = '<div class="loading">Učitavanje...</div>';

    PoziviAjax.getAdminPonude((err, ponude) => {
        if (err) { container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška.'}</div>`; return; }

        container.innerHTML = `
            <table class="admin-tabela">
                <thead><tr><th>ID</th><th>Nekretnina</th><th>Ponuđač</th><th>Cijena</th><th>Status</th><th>Vezana za</th></tr></thead>
                <tbody>
                    ${ponude.map(p => {
                        let status = 'Aktivna';
                        let statusKlasa = '';
                        if (p.prihvacenaPonuda) { status = 'Prihvaćena'; statusKlasa = 'oznaka-admin'; }
                        else if (p.odbijenaPonuda) { status = 'Odbijena'; statusKlasa = 'oznaka-prodano-mala'; }
                        return `
                            <tr>
                                <td>${p.id}</td>
                                <td>${p.Nekretnina ? p.Nekretnina.naziv : '—'}</td>
                                <td>${p.Korisnik ? '@' + p.Korisnik.username : '—'}</td>
                                <td>${p.cijenaPonude ? Helpers.formatPrice(p.cijenaPonude) : '—'}</td>
                                <td><span class="oznaka ${statusKlasa}">${status}</span></td>
                                <td>${p.idVezanePonude ? `#${p.idVezanePonude}` : '—'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    });
}

// ==== KOMENTARI ====
function ucitajKomentare() {
    const container = document.getElementById('komentari-tabela');
    container.innerHTML = '<div class="loading">Učitavanje...</div>';

    PoziviAjax.getAdminKomentari((err, komentari) => {
        if (err) { container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška.'}</div>`; return; }

        if (!komentari || komentari.length === 0) {
            container.innerHTML = '<p>Nema komentara.</p>';
            return;
        }

        container.innerHTML = `
            <table class="admin-tabela">
                <thead><tr><th>ID</th><th>Nekretnina</th><th>Autor</th><th>Tekst</th><th>Odgovor na</th><th>Akcije</th></tr></thead>
                <tbody>
                    ${komentari.map(k => `
                        <tr>
                            <td>${k.id}</td>
                            <td>${k.Nekretnina ? `<a href="detalji.html?id=${k.NekretninaId}" target="_top">${k.Nekretnina.naziv}</a>` : '—'}</td>
                            <td>${k.Korisnik ? '@' + k.Korisnik.username : '—'}</td>
                            <td class="tekst-skracen">${k.tekst}</td>
                            <td>${k.idVezanogKomentara ? `#${k.idVezanogKomentara}` : '—'}</td>
                            <td class="kolona-akcije">
                                <button type="button" class="dugme-opasnost" data-akcija="obrisi-komentar" data-id="${k.id}">Obriši</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('[data-akcija="obrisi-komentar"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('Obrisati komentar i sve odgovore na njega?')) return;
                PoziviAjax.obrisiKomentar(btn.dataset.id, (err) => {
                    if (err) { alert(err.statusText || 'Greška.'); return; }
                    ucitajKomentare(); ucitajDashboard();
                });
            });
        });
    });
}
