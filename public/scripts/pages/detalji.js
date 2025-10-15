window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const nekretninaId = urlParams.get('id') || 1;
    
    loadNekretninaDetalji(nekretninaId);
});

async function loadNekretninaDetalji(id) {
    Helpers.showLoading(document.getElementById('osnovno'));

    PoziviAjax.getNekretnina(id, (err, nekretnina) => {
        Helpers.hideLoading(document.getElementById('osnovno'));

        if (err) {
            Helpers.handleError(err, document.getElementById('osnovno'));
            return;
        }

        displayOsnovniPodaci(nekretnina);
        displayDetalji(nekretnina);
        loadTop5(nekretnina.lokacija);
        setupUpitiCarousel(nekretnina, id);
    });
}

function displayOsnovniPodaci(nekretnina) {
    document.getElementById('osnovno').innerHTML = `
        <img src="../resources/stan1.jpg" alt="Nekretnina">
        <p><strong>Naziv:</strong> ${nekretnina.naziv}</p>
        <p><strong>Kvadratura:</strong> ${nekretnina.kvadratura} m²</p>
        <p><strong>Cijena:</strong> ${Helpers.formatPrice(nekretnina.cijena)}</p>
    `;
}

function displayDetalji(nekretnina) {
    document.getElementById('detalji').innerHTML = `
        <div id="kolona1">
            <p><strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}</p>
            <p><strong>Lokacija:</strong> ${nekretnina.lokacija}</p>
        </div>
        <div id="kolona2">
            <p><strong>Godina izgradnje:</strong> ${nekretnina.godina_izgradnje}</p>
            <p><strong>Datum objave:</strong> ${Helpers.formatDate(nekretnina.datum_objave)}</p>
        </div>
        <div id="opis">
            <p><strong>Opis:</strong> ${nekretnina.opis}</p>
        </div>
    `;
}

function loadTop5(lokacija) {
    PoziviAjax.getTop5Nekretnina(lokacija, (err, top5) => {
        if (err) {
            console.error('Greška pri učitavanju top 5:', err);
            return;
        }

        const container = document.getElementById('lista-nekretnina');
        container.innerHTML = top5.map(n => `
            <div class="nekretnina-item">
                <p><strong>${n.naziv}</strong></p>
                <p>${n.lokacija} - ${Helpers.formatPrice(n.cijena)}</p>
            </div>
        `).join('');
    });
}

function setupUpitiCarousel(nekretnina, nekretninaId) {
    const sviElementi = document.querySelectorAll('#upiti .upit');
    
    // Prikazi prva 3 upita
    const upiti = nekretnina.Upiti || [];
    for (let i = 0; i < 3; i++) {
        if (upiti[i]) {
            sviElementi[i].innerHTML = `<p>${upiti[i].tekst}</p>`;
        } else {
            sviElementi[i].innerHTML = '<p>Nema više upita</p>';
        }
    }

    // Setup carousel controls
    let currentPage = 1;
    
    document.getElementById('prev').addEventListener('click', () => {
        loadUpitiPage(nekretninaId, currentPage - 1, sviElementi);
        currentPage = Math.max(1, currentPage - 1);
    });

    document.getElementById('next').addEventListener('click', () => {
        loadUpitiPage(nekretninaId, currentPage + 1, sviElementi);
        currentPage++;
    });
}

function loadUpitiPage(nekretninaId, page, sviElementi) {
    PoziviAjax.getNextUpiti(nekretninaId, page, (err, upiti) => {
        if (err || !upiti || upiti.length === 0) {
            return;
        }

        for (let i = 0; i < 3; i++) {
            if (upiti[i]) {
                sviElementi[i].innerHTML = `<p>${upiti[i].tekst}</p>`;
            } else {
                sviElementi[i].innerHTML = '<p>Nema više upita</p>';
            }
        }
    });
}