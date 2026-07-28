let trenutniKorisnik = null;

window.addEventListener('DOMContentLoaded', () => {
    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err || !korisnik.admin) {
            window.location.href = './index.html';
            return;
        }
        trenutniKorisnik = korisnik;
        setupTabovi();
        ucitajKorisnike();
        ucitajNekretnine();
        ucitajZahtjeve();
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

// ==== KORISNICI ====

function ucitajKorisnike() {
    const container = document.getElementById('korisnici-tabela');
    container.innerHTML = '<div class="loading">Učitavanje...</div>';

    PoziviAjax.getAdminKorisnici((err, korisnici) => {
        if (err) {
            container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška pri učitavanju korisnika.'}</div>`;
            return;
        }

        if (korisnici.length === 0) {
            container.innerHTML = '<p>Nema korisnika.</p>';
            return;
        }

        const redovi = korisnici.map(k => `
            <tr>
                <td>${k.id}</td>
                <td>${k.ime} ${k.prezime}</td>
                <td>@${k.username}</td>
                <td>${k.admin ? '<span class="oznaka oznaka-admin">Admin</span>' : '<span class="oznaka">Korisnik</span>'}</td>
                <td class="kolona-akcije">
                    ${k.id === trenutniKorisnik.id
                        ? '<span class="napomena">(vi)</span>'
                        : `
                            <button type="button" class="dugme-sekundarno" data-akcija="toggle-admin" data-id="${k.id}" data-admin="${k.admin}">
                                ${k.admin ? 'Ukloni admin status' : 'Postavi za admina'}
                            </button>
                            <button type="button" class="dugme-opasnost" data-akcija="obrisi-korisnika" data-id="${k.id}">Obriši</button>
                        `
                    }
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <table class="admin-tabela">
                <thead>
                    <tr><th>ID</th><th>Ime i prezime</th><th>Username</th><th>Status</th><th>Akcije</th></tr>
                </thead>
                <tbody>${redovi}</tbody>
            </table>
        `;

        container.querySelectorAll('[data-akcija="toggle-admin"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const trenutnoAdmin = btn.dataset.admin === 'true';
                PoziviAjax.patchAdminStatus(id, !trenutnoAdmin, (err) => {
                    if (err) {
                        alert(err.statusText || 'Greška prilikom promjene statusa.');
                        return;
                    }
                    ucitajKorisnike();
                });
            });
        });

        container.querySelectorAll('[data-akcija="obrisi-korisnika"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('Da li ste sigurni da želite obrisati ovog korisnika? Ova akcija je nepovratna.')) return;
                PoziviAjax.deleteAdminKorisnik(btn.dataset.id, (err) => {
                    if (err) {
                        alert(err.statusText || 'Greška prilikom brisanja korisnika.');
                        return;
                    }
                    ucitajKorisnike();
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
        if (err) {
            container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška pri učitavanju nekretnina.'}</div>`;
            return;
        }

        if (nekretnine.length === 0) {
            container.innerHTML = '<p>Nema nekretnina.</p>';
            return;
        }

        const redovi = nekretnine.map(n => `
            <tr>
                <td>${n.id}</td>
                <td>${n.naziv}</td>
                <td>${n.tip_nekretnine}</td>
                <td>${Helpers.formatPrice(n.cijena)}</td>
                <td>${n.Korisnik ? '@' + n.Korisnik.username : '—'}</td>
                <td class="kolona-akcije">
                    <a href="detalji.html?id=${n.id}" class="dugme-sekundarno" target="_top">Pogledaj</a>
                    <button type="button" class="dugme-opasnost" data-akcija="obrisi-nekretninu" data-id="${n.id}">Obriši</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <table class="admin-tabela">
                <thead>
                    <tr><th>ID</th><th>Naziv</th><th>Tip</th><th>Cijena</th><th>Vlasnik</th><th>Akcije</th></tr>
                </thead>
                <tbody>${redovi}</tbody>
            </table>
        `;

        container.querySelectorAll('[data-akcija="obrisi-nekretninu"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('Da li ste sigurni da želite obrisati ovu nekretninu?')) return;
                PoziviAjax.deleteNekretnina(btn.dataset.id, (err) => {
                    if (err) {
                        alert(err.statusText || 'Greška prilikom brisanja nekretnine.');
                        return;
                    }
                    ucitajNekretnine();
                });
            });
        });
    });
}

// ==== ZAHTJEVI ZA PREGLED ====

function ucitajZahtjeve() {
    const container = document.getElementById('zahtjevi-tabela');
    container.innerHTML = '<div class="loading">Učitavanje...</div>';

    PoziviAjax.getAdminZahtjevi((err, zahtjevi) => {
        if (err) {
            container.innerHTML = `<div class="greska-poruka">${err.statusText || 'Greška pri učitavanju zahtjeva.'}</div>`;
            return;
        }

        if (zahtjevi.length === 0) {
            container.innerHTML = '<p>Nema zahtjeva za pregled.</p>';
            return;
        }

        const redovi = zahtjevi.map(z => `
            <tr>
                <td>${z.id}</td>
                <td>${z.Nekretnina ? z.Nekretnina.naziv : '—'}</td>
                <td>${z.Korisnik ? '@' + z.Korisnik.username : '—'}</td>
                <td>${Helpers.formatDate(z.trazeniDatum)}</td>
                <td>${z.tekst}</td>
                <td>${z.odobren ? '<span class="oznaka oznaka-admin">Odobren</span>' : '<span class="oznaka">Na čekanju</span>'}</td>
                <td class="kolona-akcije">
                    ${!z.odobren ? `<button type="button" class="dugme-sekundarno" data-akcija="odobri" data-id="${z.id}" data-nid="${z.NekretninaId}">Odobri</button>` : ''}
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <table class="admin-tabela">
                <thead>
                    <tr><th>ID</th><th>Nekretnina</th><th>Korisnik</th><th>Traženi datum</th><th>Tekst</th><th>Status</th><th>Akcije</th></tr>
                </thead>
                <tbody>${redovi}</tbody>
            </table>
        `;

        container.querySelectorAll('[data-akcija="odobri"]').forEach(btn => {
            btn.addEventListener('click', () => {
                PoziviAjax.putNekretninaZahtjevZid(btn.dataset.nid, btn.dataset.id, { odobren: true }, (err) => {
                    if (err) {
                        alert(err.statusText || 'Greška prilikom odobravanja zahtjeva.');
                        return;
                    }
                    ucitajZahtjeve();
                });
            });
        });
    });
}
