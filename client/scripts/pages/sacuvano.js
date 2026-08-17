document.addEventListener('DOMContentLoaded', ucitajSacuvano);

function ucitajSacuvano() {
    PoziviAjax.getSacuvano((err, data) => {
        if (err) {
            if (err.status === 401) {
                location.href = 'prijava.html';
                return;
            }
            document.getElementById('saved-properties').innerHTML = '<p class="saved-empty">Sačuvane stavke trenutno nisu dostupne.</p>';
            document.getElementById('saved-searches').innerHTML = '';
            return;
        }
        prikaziOmiljene(data.omiljene || []);
        prikaziPretrage(data.pretrage || []);
    });
}

function prikaziOmiljene(items) {
    const container = document.getElementById('saved-properties');
    if (!items.length) {
        container.innerHTML = '<p class="saved-empty">Još nemate omiljenih nekretnina. Dodajte ih pritiskom na srce u katalogu.</p>';
        return;
    }
    container.innerHTML = items.map((item) => {
        const slike = item.Slike || [];
        const slika = slike.find((photo) => photo.glavna) || slike[0];
        return `<article class="saved-card">
            <div class="saved-card__image"><img src="${slika ? Helpers.escapeHtml(slika.url) : '../resources/stan1.jpg'}" alt="${Helpers.escapeHtml(item.naziv)}"></div>
            <div class="saved-card__body"><p class="saved-card__location">${Helpers.escapeHtml(item.lokacija)}</p><h3><a href="detalji.html?id=${item.id}">${Helpers.escapeHtml(item.naziv)}</a></h3><div class="saved-card__footer"><p class="saved-card__price">${Helpers.formatPrice(item.cijena)}</p><button type="button" class="remove-favorite" data-id="${item.id}">Ukloni</button></div></div>
        </article>`;
    }).join('');
    container.querySelectorAll('.remove-favorite').forEach((button) => button.addEventListener('click', () => {
        PoziviAjax.ukloniOmiljenu(button.dataset.id, (err) => {
            if (err) return alert(err.statusText || 'Nekretninu nije moguće ukloniti.');
            ucitajSacuvano();
        });
    }));
}

function urlPretrage(pretraga) {
    const params = new URLSearchParams();
    if (pretraga.lokacija) params.set('lokacija', pretraga.lokacija);
    if (pretraga.tip) params.set('tip', pretraga.tip);
    if (pretraga.maxCijena) params.set('maxCijena', pretraga.maxCijena);
    if (pretraga.sortiranje) params.set('sortiranje', pretraga.sortiranje);
    return `nekretnine.html${params.toString() ? `?${params}` : ''}`;
}

function prikaziPretrage(pretrage) {
    const container = document.getElementById('saved-searches');
    if (!pretrage.length) {
        container.innerHTML = '<p class="saved-empty">Još nemate sačuvanih pretraga. Postavite filtere u katalogu i odaberite „Sačuvaj pretragu“.</p>';
        return;
    }
    container.innerHTML = pretrage.map((pretraga) => {
        const kriteriji = [pretraga.lokacija, pretraga.tip, pretraga.maxCijena ? `do ${Helpers.formatPrice(pretraga.maxCijena)}` : null].filter(Boolean);
        return `<article class="search-card"><div><h3>${Helpers.escapeHtml(pretraga.naziv)}</h3><div class="search-card__criteria">${(kriteriji.length ? kriteriji : ['Sve nekretnine']).map((tekst) => `<span>${Helpers.escapeHtml(tekst)}</span>`).join('')}</div></div><div class="search-card__actions"><a class="search-card__open" href="${urlPretrage(pretraga)}">Otvori →</a><button type="button" class="delete-search" data-id="${pretraga.id}">Obriši</button></div></article>`;
    }).join('');
    container.querySelectorAll('.delete-search').forEach((button) => button.addEventListener('click', () => {
        PoziviAjax.obrisiSacuvanuPretragu(button.dataset.id, (err) => {
            if (err) return alert(err.statusText || 'Pretragu nije moguće obrisati.');
            ucitajSacuvano();
        });
    }));
}
