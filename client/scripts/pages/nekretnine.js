let trenutniKorisnik = null;
let sveNekretnine = [];

window.addEventListener('DOMContentLoaded', () => {
    PoziviAjax.getKorisnik((err, user) => {
        trenutniKorisnik = err ? null : user;
        ucitajNekretnine();
        postaviModal();
    });
    document.getElementById('filter-forma').addEventListener('submit', (event) => {
        event.preventDefault();
        primijeniFiltere();
    });
    document.getElementById('ponisti-filtere').addEventListener('click', ponistiFiltere);
    document.getElementById('sortiranje').addEventListener('change', primijeniFiltere);
});

function ucitajNekretnine() {
    PoziviAjax.getNekretnine((err, result) => {
        const list = document.getElementById('lista-nekretnina');
        if (err) {
            list.innerHTML = '<p class="catalog-message">Nekretnine trenutno nisu dostupne. Pokušajte ponovo.</p>';
            return;
        }
        sveNekretnine = Array.isArray(result) ? result : (result.data || []);
        ucitajFiltereIzURL();
        primijeniFiltere();
    });
}

function ucitajFiltereIzURL() {
    const params = new URLSearchParams(location.search);
    document.getElementById('filter-lokacija').value = params.get('lokacija') || '';
    document.getElementById('filter-tip').value = params.get('tip') || '';
    document.getElementById('filter-cijena').value = params.get('maxCijena') || '';
}

function primijeniFiltere() {
    const query = document.getElementById('filter-lokacija').value.trim().toLocaleLowerCase('bs');
    const type = document.getElementById('filter-tip').value;
    const max = Number(document.getElementById('filter-cijena').value) || Infinity;
    const sort = document.getElementById('sortiranje').value;
    const items = sveNekretnine.filter((item) => (
        (!query || `${item.naziv} ${item.lokacija}`.toLocaleLowerCase('bs').includes(query)) &&
        (!type || item.tip_nekretnine === type) && Number(item.cijena) <= max
    ));
    if (sort === 'cijena-asc') items.sort((a, b) => Number(a.cijena) - Number(b.cijena));
    if (sort === 'cijena-desc') items.sort((a, b) => Number(b.cijena) - Number(a.cijena));
    if (sort === 'kvadratura-desc') items.sort((a, b) => Number(b.kvadratura) - Number(a.kvadratura));
    if (sort === 'najnovije') items.sort((a, b) => String(b.datum_objave).localeCompare(String(a.datum_objave)));
    prikaziNekretnine(items);
    document.getElementById('rezultati-naslov').textContent = `${items.length} ${items.length === 1 ? 'dostupna nekretnina' : 'dostupnih nekretnina'}`;
}

function ponistiFiltere() {
    document.getElementById('filter-forma').reset();
    history.replaceState(null, '', location.pathname);
    primijeniFiltere();
}

function moguUpravljati(item) {
    return !!trenutniKorisnik && (trenutniKorisnik.admin || item.KorisnikId === trenutniKorisnik.id);
}

function glavnaSlika(item) {
    const slike = item.Slike || [];
    return slike.find((slika) => slika.glavna) || slike[0] || null;
}

function prikaziNekretnine(items) {
    const list = document.getElementById('lista-nekretnina');
    if (!items.length) {
        list.innerHTML = '<p class="catalog-message">Nema nekretnina koje odgovaraju odabranim kriterijima.</p>';
        return;
    }
    list.innerHTML = items.map((item) => {
        const slika = glavnaSlika(item);
        return `<article class="catalog-card">
            <div class="catalog-card__image">
                <img src="${slika ? Helpers.escapeHtml(slika.url) : '../resources/stan1.jpg'}" alt="${Helpers.escapeHtml(item.naziv)}">
                <span class="catalog-card__type">${Helpers.escapeHtml(item.tip_nekretnine)}</span>
                ${(item.Slike || []).length > 1 ? `<span class="catalog-card__photo-count">${item.Slike.length} fotografija</span>` : ''}
            </div>
            <div class="catalog-card__body">
                <p class="catalog-card__location">${Helpers.escapeHtml(item.lokacija)}</p>
                <h3><a href="detalji.html?id=${item.id}">${Helpers.escapeHtml(item.naziv)}</a></h3>
                <div class="catalog-card__facts"><span>${item.kvadratura} m²</span><span>${Helpers.escapeHtml(item.tip_grijanja || 'Grijanje n/a')}</span><span>${item.godina_izgradnje || 'Godina n/a'}</span></div>
                <div class="catalog-card__footer"><p class="catalog-card__price">${Helpers.formatPrice(item.cijena)}</p><a class="catalog-card__details" href="detalji.html?id=${item.id}">Detalji →</a></div>
            </div>
            ${moguUpravljati(item) ? `<div class="catalog-card__actions"><button type="button" class="dugme-uredi" data-id="${item.id}">Uredi</button><button type="button" class="dugme-obrisi" data-id="${item.id}">Obriši</button></div>` : ''}
        </article>`;
    }).join('');
    list.querySelectorAll('.dugme-uredi').forEach((button) => button.addEventListener('click', () => {
        otvoriModalZaUredjivanje(sveNekretnine.find((item) => String(item.id) === button.dataset.id));
    }));
    list.querySelectorAll('.dugme-obrisi').forEach((button) => button.addEventListener('click', () => obrisiNekretninu(button.dataset.id)));
}

function obrisiNekretninu(id) {
    if (!confirm('Da li ste sigurni da želite obrisati ovu nekretninu?')) return;
    PoziviAjax.deleteNekretnina(id, (err) => {
        if (err) return alert(err.statusText || 'Brisanje nije uspjelo.');
        ucitajNekretnine();
    });
}

function postaviModal() {
    const add = document.getElementById('dodaj-nekretninu-dugme');
    const overlay = document.getElementById('modal-overlay');
    add.addEventListener('click', () => {
        if (!trenutniKorisnik) return void (location.href = 'prijava.html');
        otvoriModalZaDodavanje();
    });
    document.getElementById('modal-zatvori').addEventListener('click', zatvoriModal);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) zatvoriModal(); });
    document.getElementById('nekretnina-forma').addEventListener('submit', (event) => {
        event.preventDefault();
        sacuvajNekretninu();
    });
}

function otvoriModalZaDodavanje() {
    document.getElementById('modal-naslov').textContent = 'Objavi novu nekretninu';
    document.getElementById('nekretnina-forma').reset();
    document.getElementById('nekretnina-id').value = '';
    document.getElementById('modal-poruka').hidden = true;
    prikaziPhotoManager(null);
    document.getElementById('modal-overlay').classList.remove('skriven');
}

function otvoriModalZaUredjivanje(item) {
    document.getElementById('modal-naslov').textContent = 'Uredi nekretninu';
    document.getElementById('nekretnina-id').value = item.id;
    document.getElementById('f-tip').value = item.tip_nekretnine;
    document.getElementById('f-naziv').value = item.naziv;
    document.getElementById('f-kvadratura').value = item.kvadratura;
    document.getElementById('f-cijena').value = item.cijena;
    document.getElementById('f-lokacija').value = item.lokacija;
    document.getElementById('f-grijanje').value = item.tip_grijanja || '';
    document.getElementById('f-godina').value = item.godina_izgradnje || '';
    document.getElementById('f-opis').value = item.opis || '';
    document.getElementById('f-fotografije').value = '';
    document.getElementById('modal-poruka').hidden = true;
    prikaziPhotoManager(item);
    document.getElementById('modal-overlay').classList.remove('skriven');
}

function prikaziPhotoManager(item) {
    const section = document.getElementById('fotografije-postojeci');
    const grid = document.getElementById('photo-manager-grid');
    const slike = item?.Slike || [];
    section.hidden = !item || !slike.length;
    grid.innerHTML = slike.map((slika) => `<div class="photo-manager__item">
        <img src="${Helpers.escapeHtml(slika.url)}" alt="Fotografija nekretnine">
        ${slika.glavna ? '<span class="photo-main-label">Glavna</span>' : ''}
        <div class="photo-manager__actions">${slika.glavna ? '' : `<button type="button" class="photo-main" data-id="${slika.id}">Postavi glavnu</button>`}<button type="button" class="photo-delete" data-id="${slika.id}">Obriši</button></div>
    </div>`).join('');
    grid.querySelectorAll('.photo-main').forEach((button) => button.addEventListener('click', () => promijeniGlavnuSliku(item.id, button.dataset.id)));
    grid.querySelectorAll('.photo-delete').forEach((button) => button.addEventListener('click', () => obrisiSliku(item.id, button.dataset.id)));
}

function osvjeziPhotoManager(nekretninaId) {
    PoziviAjax.getNekretnina(nekretninaId, (err, item) => {
        if (err) return;
        const index = sveNekretnine.findIndex((n) => n.id === item.id);
        if (index >= 0) sveNekretnine[index] = item;
        prikaziPhotoManager(item);
    });
}

function promijeniGlavnuSliku(nekretninaId, slikaId) {
    PoziviAjax.postaviGlavnuSliku(nekretninaId, slikaId, (err) => {
        if (err) return alert(err.statusText || 'Glavna fotografija nije promijenjena.');
        osvjeziPhotoManager(nekretninaId);
    });
}

function obrisiSliku(nekretninaId, slikaId) {
    if (!confirm('Obrisati ovu fotografiju?')) return;
    PoziviAjax.obrisiSlikuNekretnine(nekretninaId, slikaId, (err) => {
        if (err) return alert(err.statusText || 'Fotografija nije obrisana.');
        osvjeziPhotoManager(nekretninaId);
    });
}

function zatvoriModal() {
    document.getElementById('modal-overlay').classList.add('skriven');
}

function uploadujSlikeRedom(nekretninaId, files, callback) {
    let index = 0;
    const next = () => {
        if (index >= files.length) return callback(null);
        PoziviAjax.uploadSlikaNekretnine(nekretninaId, files[index++], (err) => {
            if (err) return callback(err);
            next();
        });
    };
    next();
}

function sacuvajNekretninu() {
    const id = document.getElementById('nekretnina-id').value;
    const files = Array.from(document.getElementById('f-fotografije').files || []);
    const data = {
        tip_nekretnine: document.getElementById('f-tip').value,
        naziv: document.getElementById('f-naziv').value.trim(),
        kvadratura: Number(document.getElementById('f-kvadratura').value),
        cijena: Number(document.getElementById('f-cijena').value),
        lokacija: document.getElementById('f-lokacija').value.trim(),
        tip_grijanja: document.getElementById('f-grijanje').value.trim() || null,
        godina_izgradnje: document.getElementById('f-godina').value || null,
        opis: document.getElementById('f-opis').value.trim() || null,
    };
    const button = document.getElementById('nekretnina-sacuvaj-dugme');
    const message = document.getElementById('modal-poruka');
    button.disabled = true;
    button.textContent = 'Čuvanje…';

    const finish = (err, saved) => {
        if (err) {
            button.disabled = false;
            button.textContent = 'Sačuvaj nekretninu';
            message.hidden = false;
            message.textContent = err.statusText || 'Čuvanje nije uspjelo.';
            return;
        }
        if (!files.length) {
            button.disabled = false;
            button.textContent = 'Sačuvaj nekretninu';
            zatvoriModal();
            ucitajNekretnine();
            return;
        }
        button.textContent = 'Upload fotografija…';
        uploadujSlikeRedom(saved.id, files, (uploadErr) => {
            button.disabled = false;
            button.textContent = 'Sačuvaj nekretninu';
            if (uploadErr) {
                message.hidden = false;
                message.textContent = `Oglas je sačuvan, ali neke fotografije nisu: ${uploadErr.statusText}`;
                osvjeziPhotoManager(saved.id);
                return;
            }
            zatvoriModal();
            ucitajNekretnine();
        });
    };
    if (id) PoziviAjax.putNekretnina(id, data, finish);
    else PoziviAjax.postNekretnina(data, finish);
}
