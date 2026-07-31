window.addEventListener('DOMContentLoaded', () => {
    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err || !korisnik) {
            window.location.href = './prijava.html';
            return;
        }
        setupTabovi();
        ucitajUpite();
        ucitajPonude();
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

function ucitajUpite() {
    const container = document.getElementById('upiti-sadrzaj');

    PoziviAjax.getMojiUpiti((err, data) => {
        if (err || !data) {
            container.innerHTML = '<p class="greska-poruka">Greška pri učitavanju upita.</p>';
            return;
        }

        const upiti = data.izabraniUpiti || [];

        if (upiti.length === 0) {
            container.innerHTML = '<div class="prazno-stanje"><p>Još niste poslali nijedan upit.</p><a href="nekretnine.html" class="btn-akcija">Pregledaj nekretnine</a></div>';
            return;
        }

        container.innerHTML = `
            <p class="broj-stavki">Ukupno upita: <strong>${upiti.length}</strong></p>
            <div class="kartice-grid">
                ${upiti.map(u => `
                    <div class="kartica">
                        <div class="kartica-header">
                            <span class="kartica-tip">Upit</span>
                            <a href="detalji.html?id=${u.id_nekretnine}" class="kartica-link">Nekretnina #${u.id_nekretnine}</a>
                        </div>
                        <p class="kartica-tekst">${u.tekst_upita}</p>
                        ${u.odgovor ? `<div class="kartica-odgovor"><strong>Odgovor vlasnika:</strong><p>${u.odgovor}</p></div>` : '<p class="kartica-ceka">Čeka odgovor...</p>'}
                        <a href="detalji.html?id=${u.id_nekretnine}" class="btn-kartica">Pogledaj nekretninu →</a>
                    </div>
                `).join('')}
            </div>
        `;
    });
}

function ucitajPonude() {
    const container = document.getElementById('ponude-sadrzaj');

    PoziviAjax.getMojePonude((err, ponude) => {
        if (err) {
            container.innerHTML = '<p class="greska-poruka">Greška pri učitavanju ponuda.</p>';
            return;
        }

        if (!ponude || ponude.length === 0) {
            container.innerHTML = '<div class="prazno-stanje"><p>Još niste napravili nijednu ponudu.</p><a href="nekretnine.html" class="btn-akcija">Pregledaj nekretnine</a></div>';
            return;
        }

        container.innerHTML = `
            <p class="broj-stavki">Ukupno ponuda: <strong>${ponude.length}</strong></p>
            <div class="kartice-grid">
                ${ponude.map(p => {
                    const nekretnina = p.Nekretnina;
                    let statusKlasa = '';
                    let statusTekst = 'Aktivna';
                    if (p.prihvacenaPonuda) { statusKlasa = 'status-prihvacena'; statusTekst = 'Prihvaćena'; }
                    else if (p.odbijenaPonuda) { statusKlasa = 'status-odbijena'; statusTekst = 'Odbijena'; }

                    return `
                        <div class="kartica ${statusKlasa}">
                            <div class="kartica-header">
                                <span class="kartica-tip">Ponuda</span>
                                ${nekretnina ? `<a href="detalji.html?id=${nekretnina.id}" class="kartica-link">${nekretnina.naziv}</a>` : ''}
                            </div>
                            <p class="kartica-tekst">${p.tekst}</p>
                            ${p.cijenaPonude ? `<p class="kartica-cijena">${Helpers.formatPrice(p.cijenaPonude)}</p>` : ''}
                            <p class="kartica-datum">Datum: ${Helpers.formatDate(p.datumPonude)}</p>
                            <div class="status-oznaka ${statusKlasa}">${statusTekst}</div>
                            ${p.idVezanePonude ? `<p class="kartica-info">Odgovor na ponudu #${p.idVezanePonude}</p>` : ''}
                            ${nekretnina ? `<a href="detalji.html?id=${nekretnina.id}" class="btn-kartica">Pogledaj nekretninu →</a>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    });
}
