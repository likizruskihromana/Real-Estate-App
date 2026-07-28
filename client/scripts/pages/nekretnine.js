let trenutniKorisnik = null;
let sveNekretnine = [];

window.addEventListener('DOMContentLoaded', () => {
    PoziviAjax.getKorisnik((err, korisnik) => {
        trenutniKorisnik = err ? null : korisnik;
        loadNekretnine();
        setupModal();
    });
});

function filtrirajPoTipu(nekretnine, tip) {
    return nekretnine.filter(n => n.tip_nekretnine === tip);
}

async function loadNekretnine() {
    Helpers.showLoading(document.body);

    PoziviAjax.getMojeNekretnine((err, nekretnine) => {
        Helpers.hideLoading(document.body);

        if (err) {
            Helpers.handleError(err, document.body);
            return;
        }

        sveNekretnine = nekretnine;

        renderNekretnineByType('Stan', 'stan');
        renderNekretnineByType('Kuća', 'kuca');
        renderNekretnineByType('Poslovni prostor', 'pp');
    });
}

function renderNekretnineByType(tip, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const gridContainer = container.querySelector('.grid-lista-nekretnina');
    if (!gridContainer) return;

    const filtrirane = filtrirajPoTipu(sveNekretnine, tip);

    gridContainer.innerHTML = '';

    if (filtrirane.length === 0) {
        gridContainer.innerHTML = '<p>Nema dostupnih nekretnina.</p>';
        return;
    }

    filtrirane.forEach(nekretnina => {
        const card = createNekretninaCard(nekretnina);
        gridContainer.appendChild(card);
    });
}

function moguUpravljati(nekretnina) {
    if (!trenutniKorisnik) return false;
    return trenutniKorisnik.admin || nekretnina.KorisnikId === trenutniKorisnik.id;
}

function createNekretninaCard(nekretnina) {
    const div = document.createElement('div');
    div.className = 'nekretnina';

    div.innerHTML = `
        <img class="slika-nekretnine" src="../resources/stan1.jpg" alt="${nekretnina.naziv}">
        <div class="detalji-nekretnine">
            <h3>${nekretnina.naziv}</h3>
            <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
        </div>
        <div class="cijena-nekretnine">
            <p>Cijena: ${Helpers.formatPrice(nekretnina.cijena)}</p>
        </div>
        <a href="detalji.html?id=${nekretnina.id}" class="detalji-dugme">Detalji</a>
        ${moguUpravljati(nekretnina) ? `
            <div class="nekretnina-akcije">
                <button type="button" class="dugme-uredi" data-id="${nekretnina.id}">Uredi</button>
                <button type="button" class="dugme-obrisi" data-id="${nekretnina.id}">Obriši</button>
            </div>
        ` : ''}
    `;

    const dugmeUredi = div.querySelector('.dugme-uredi');
    if (dugmeUredi) {
        dugmeUredi.addEventListener('click', () => otvoriModalZaUredjivanje(nekretnina));
    }

    const dugmeObrisi = div.querySelector('.dugme-obrisi');
    if (dugmeObrisi) {
        dugmeObrisi.addEventListener('click', () => obrisiNekretninu(nekretnina.id));
    }

    return div;
}

function obrisiNekretninu(id) {
    if (!confirm('Da li ste sigurni da želite obrisati ovu nekretninu? Ova akcija je nepovratna.')) {
        return;
    }
    PoziviAjax.deleteNekretnina(id, (err) => {
        if (err) {
            alert((err.statusText) || 'Greška prilikom brisanja nekretnine.');
            return;
        }
        loadNekretnine();
    });
}

// ==== MODAL: dodavanje / uređivanje nekretnine ====

function setupModal() {
    const dodajDugme = document.getElementById('dodaj-nekretninu-dugme');
    const overlay = document.getElementById('modal-overlay');
    const zatvoriDugme = document.getElementById('modal-zatvori');
    const forma = document.getElementById('nekretnina-forma');

console.log("dodaj:", dodajDugme);
console.log("overlay:", overlay);
console.log("zatvori:", zatvoriDugme);
console.log("forma:", forma);

if (!dodajDugme || !overlay || !zatvoriDugme || !forma) {
    console.error("Neki element nedostaje.");
    return;
}

    dodajDugme.addEventListener('click', () => {
        if (!trenutniKorisnik) {
            window.location.href = './prijava.html';
            return;
        }
        otvoriModalZaDodavanje();
    });

    zatvoriDugme.addEventListener('click', zatvoriModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) zatvoriModal();
    });

    forma.addEventListener('submit', (e) => {
        e.preventDefault();
        sacuvajNekretninu();
    });
}

function otvoriModalZaDodavanje() {
    document.getElementById('modal-naslov').textContent = 'Dodaj novu nekretninu';
    document.getElementById('nekretnina-forma').reset();
    document.getElementById('nekretnina-id').value = '';
    document.getElementById('modal-poruka').style.display = 'none';
    document.getElementById('modal-overlay').classList.remove('skriven');
}

function otvoriModalZaUredjivanje(nekretnina) {
    document.getElementById('modal-naslov').textContent = 'Uredi nekretninu';
    document.getElementById('nekretnina-id').value = nekretnina.id;
    document.getElementById('f-tip').value = nekretnina.tip_nekretnine;
    document.getElementById('f-naziv').value = nekretnina.naziv;
    document.getElementById('f-kvadratura').value = nekretnina.kvadratura;
    document.getElementById('f-cijena').value = nekretnina.cijena;
    document.getElementById('f-lokacija').value = nekretnina.lokacija;
    document.getElementById('f-grijanje').value = nekretnina.tip_grijanja || '';
    document.getElementById('f-godina').value = nekretnina.godina_izgradnje || '';
    document.getElementById('f-opis').value = nekretnina.opis || '';
    document.getElementById('modal-poruka').style.display = 'none';
    document.getElementById('modal-overlay').classList.remove('skriven');
}

function zatvoriModal() {
    document.getElementById('modal-overlay').classList.add('skriven');
}

function sacuvajNekretninu() {
    const id = document.getElementById('nekretnina-id').value;
    const podaci = {
        tip_nekretnine: document.getElementById('f-tip').value,
        naziv: document.getElementById('f-naziv').value.trim(),
        kvadratura: parseInt(document.getElementById('f-kvadratura').value),
        cijena: parseFloat(document.getElementById('f-cijena').value),
        lokacija: document.getElementById('f-lokacija').value.trim(),
        tip_grijanja: document.getElementById('f-grijanje').value.trim() || null,
        godina_izgradnje: document.getElementById('f-godina').value || null,
        opis: document.getElementById('f-opis').value.trim() || null,
    };

    const dugme = document.getElementById('nekretnina-sacuvaj-dugme');
    dugme.disabled = true;
    dugme.textContent = 'Čuvanje...';

    const zavrsi = (err) => {
        dugme.disabled = false;
        dugme.textContent = 'Sačuvaj';

        if (err) {
            const poruka = document.getElementById('modal-poruka');
            poruka.style.display = 'block';
            poruka.textContent = (err.statusText) || 'Greška prilikom čuvanja nekretnine.';
            return;
        }

        zatvoriModal();
        loadNekretnine();
    };

    if (id) {
        PoziviAjax.putNekretnina(id, podaci, zavrsi);
    } else {
        PoziviAjax.postNekretnina(podaci, zavrsi);
    }
}
