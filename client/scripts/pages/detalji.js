window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const nekretninaId = urlParams.get('id') || 1;
    
    loadNekretninaDetalji(nekretninaId);
    loadKomentari(nekretninaId);
});

function toggleFormaOdgovora(komentarId) {
    const forma = document.getElementById(`forma-odgovor-komentar-${komentarId}`);
    if (forma) {
        forma.style.display = forma.style.display === 'none' ? 'block' : 'none';
    }
}

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
        initUpitiCarousel(id, nekretnina.Upiti || []);
    });

    loadInteresovanja(id);
    loadKomentari(id);
}

function displayOsnovniPodaci(nekretnina) {
    document.getElementById('osnovno').innerHTML = `
        <h1><strong> ${nekretnina.naziv}</strong></h1>
        <p><strong>Kvadratura:</strong> ${nekretnina.kvadratura} m²</p>
        <p><strong>Cijena:</strong> ${Helpers.formatPrice(nekretnina.cijena)}</p>
    `;
}

function displayDetalji(nekretnina) {
    document.getElementById('detalji').innerHTML = `
        <p><strong>Tip grijanja: </strong> ${nekretnina.tip_grijanja}</p>
        <p><strong>Lokacija: </strong> ${nekretnina.lokacija}</p>
        <p><strong>Godina izgradnje: </strong> ${nekretnina.godina_izgradnje}</p>
        <p><strong>Datum objave: </strong> ${Helpers.formatDate(nekretnina.datum_objave)}</p>
        <p><strong>Opis: </strong> ${nekretnina.opis}</p>
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
            <a href="/detalji.html?id=${n.id}" class="nekretnina-card-link" style="text-decoration: none; color: inherit;">
                <div class="nekretnina-item">
                    <p><strong>${n.naziv}</strong></p>
                    <p>${n.lokacija} - ${Helpers.formatPrice(n.cijena)}</p>
                </div>
            </a>
        `).join('');
    });
}

function initUpitiCarousel(nekretninaId, prvaTriUpita) {
    const sviElementi = document.querySelectorAll('#upiti .upit');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    const stranicaKes = { 0: prvaTriUpita };
    let trenutnaStranica = 0;
    let nemaViseUpita = !prvaTriUpita || prvaTriUpita.length < 3;

    const prikaziStranicu = (upiti) => {
        for (let i = 0; i < 3; i++) {
            if (upiti && upiti[i]) {
                const u = upiti[i];
                const autorIme = u.Korisnik ? (u.Korisnik.ime ? `${u.Korisnik.ime} ${u.Korisnik.prezime}` : u.Korisnik.korisnickoIme) : 'Korisnik';
                sviElementi[i].innerHTML = `<p><strong>${autorIme}:</strong> ${u.tekst}</p>`;
            } else {
                sviElementi[i].innerHTML = '<p>Nema više upita</p>';
            }
        }
        prevBtn.disabled = trenutnaStranica === 0;
        nextBtn.disabled = nemaViseUpita && !stranicaKes[trenutnaStranica + 1];
    };

    prikaziStranicu(stranicaKes[0]);

    prevBtn.addEventListener('click', () => {
        if (trenutnaStranica === 0) return;
        trenutnaStranica--;
        prikaziStranicu(stranicaKes[trenutnaStranica]);
    });

    nextBtn.addEventListener('click', () => {
        const sljedecaStranica = trenutnaStranica + 1;

        if (stranicaKes[sljedecaStranica]) {
            trenutnaStranica = sljedecaStranica;
            prikaziStranicu(stranicaKes[trenutnaStranica]);
            return;
        }

        if (nemaViseUpita) return;

        PoziviAjax.getNextUpiti(nekretninaId, sljedecaStranica, (err, upiti) => {
            if (err || !upiti || upiti.length === 0) {
                nemaViseUpita = true;
                nextBtn.disabled = true;
                return;
            }

            stranicaKes[sljedecaStranica] = upiti;
            if (upiti.length < 3) {
                nemaViseUpita = true;
            }
            trenutnaStranica = sljedecaStranica;
            prikaziStranicu(stranicaKes[trenutnaStranica]);
        });
    });
}

// ==== INTERESOVANJA ====

let trenutnaNekretninaId = null;

function loadInteresovanja(nekretninaId) {
    trenutnaNekretninaId = nekretninaId;
    PoziviAjax.getKorisnik((korisnikErr, korisnik) => {
        const trenutniKorisnik = korisnikErr ? null : korisnik;

        PoziviAjax.getNekretninaInteresovanja(nekretninaId, (err, interesovanja) => {
            if (err) {
                console.error('Greška pri učitavanju interesovanja:', err);
                return;
            }

            prikaziListuInteresovanja(interesovanja, trenutniKorisnik);
            setupFormaInteresovanje(nekretninaId, trenutniKorisnik, interesovanja.ponude || []);
        });
    });
}

function prikaziListuInteresovanja(interesovanja, trenutniKorisnik) {
    const container = document.getElementById('lista-interesovanja');
    const mozeOdgovarati = !!(trenutniKorisnik && (trenutniKorisnik.admin || interesovanja.jeVlasnik));
    const jeVlasnikNekretnine = !!(trenutniKorisnik && (trenutniKorisnik.admin || interesovanja.jeVlasnik));

    const upiti = (interesovanja.upiti || []).map(u => {
        const autorIme = u.Korisnik ? (u.Korisnik.ime ? `${u.Korisnik.ime} ${u.Korisnik.prezime}` : u.Korisnik.korisnickoIme) : 'Korisnik';
        return `
            <div class="interesovanje-item">
                <p><strong>#${u.id} — Upit</strong> (Autor: ${autorIme})</p>
                <p>${u.tekst}</p>
                ${u.odgovor
                    ? `<p class="odgovor-vlasnika"><strong>Odgovor:</strong> ${u.odgovor}</p>`
                    : (mozeOdgovarati ? `
                        <form class="forma-odgovor" data-tip="upit" data-id="${u.id}">
                            <textarea placeholder="Napišite odgovor..." required></textarea>
                            <button type="submit">Odgovori</button>
                        </form>
                    ` : '')}
            </div>
        `;
    });
const zahtjevi = (interesovanja.zahtjevi || []).map(z => {
        const autorIme = z.Korisnik ? (z.Korisnik.ime ? `${z.Korisnik.ime} ${z.Korisnik.prezime}` : z.Korisnik.korisnickoIme) : 'Korisnik';
        return `
            <div class="interesovanje-item ${z.odobren ? 'odobren' : ''}">
                <p><strong>#${z.id} — Zahtjev za pregled</strong> (Autor: ${autorIme})</p>
                <p>${z.tekst}</p>
                <p>Traženi datum: ${Helpers.formatDate(z.trazeniDatum)}</p>
                <p>Status: ${z.odobren ? 'Odobren' : 'Na čekanju / nije odobren'}</p>
                ${z.odgovor ? `<p class="odgovor-vlasnika"><strong>Odgovor:</strong> ${z.odgovor}</p>` : ''}
                ${(mozeOdgovarati && !z.odobren) ? `
                    <form class="forma-odgovor" data-tip="zahtjev" data-id="${z.id}">
                        <textarea placeholder="Napišite odgovor (opciono)..."></textarea>
                        <div class="forma-odgovor-dugmad">
                            <button type="submit" data-odobri="true">Odobri</button>
                            <button type="submit" data-odobri="false">Odbij</button>
                        </div>
                    </form>
                ` : ''}
            </div>
        `;
    });

    let ponude = [];
    if (jeVlasnikNekretnine) {
        ponude = (interesovanja.ponude || []).map(p => {
            const ponudjacIme = p.Korisnik ? (p.Korisnik.ime ? `${p.Korisnik.ime} ${p.Korisnik.prezime}` : p.Korisnik.korisnickoIme) : 'Korisnik';
            return `
                <div class="interesovanje-item ${p.odbijenaPonuda ? 'odbijena' : ''}">
                    <p><strong>#${p.id} — Ponuda${p.idVezanePonude ? ` (odgovor na #${p.idVezanePonude})` : ''}</strong> (Ponuđač: ${ponudjacIme})</p>
                    <p>${p.tekst}</p>
                    ${p.cijenaPonude !== undefined ? `<p>Cijena: ${Helpers.formatPrice(p.cijenaPonude)}</p>` : ''}
                    <p>Status: ${p.odbijenaPonuda ? 'Odbijena' : 'Aktivna'}</p>
                    ${p.mozeOdgovoriti ? '<p class="napomena-ponuda">Možete odgovoriti na ovu ponudu putem forme ispod.</p>' : ''}
                </div>
            `;
        });
    }

    const sveStavke = [...upiti, ...zahtjevi, ...ponude];
    container.innerHTML = sveStavke.length
        ? sveStavke.join('')
        : '<p>Za ovu nekretninu još nema interesovanja.</p>';

    container.querySelectorAll('.forma-odgovor').forEach(forma => {
        forma.addEventListener('submit', (e) => {
            e.preventDefault();
            const tip = forma.dataset.tip;
            const id = forma.dataset.id;
            const tekstOdgovora = forma.querySelector('textarea').value.trim();
            const submitter = e.submitter;

            const dugmad = forma.querySelectorAll('button');
            dugmad.forEach(d => d.disabled = true);

            if (tip === 'upit') {
                if (!tekstOdgovora) {
                    alert('Odgovor ne smije biti prazan.');
                    dugmad.forEach(d => d.disabled = false);
                    return;
                }
                PoziviAjax.putUpitOdgovor(id, tekstOdgovora, (err) => {
                    if (err) {
                        alert((err && err.statusText) || 'Greška prilikom slanja odgovora.');
                        dugmad.forEach(d => d.disabled = false);
                        return;
                    }
                    loadInteresovanja(trenutnaNekretninaId);
                });
            } else if (tip === 'zahtjev') {
                const odobren = submitter ? submitter.dataset.odobri === 'true' : true;
                PoziviAjax.putNekretninaZahtjevZid(trenutnaNekretninaId, id, { odobren, odgovor: tekstOdgovora || undefined }, (err) => {
                    if (err) {
                        alert((err && err.statusText) || 'Greška prilikom obrade zahtjeva.');
                        dugmad.forEach(d => d.disabled = false);
                        return;
                    }
                    loadInteresovanja(trenutnaNekretninaId);
                });
            }
        });
    });
}

function setupFormaInteresovanje(nekretninaId, trenutniKorisnik, sveponude) {
    const forma = document.getElementById('forma-interesovanje');
    const tipSelect = document.getElementById('tip-interesovanja');
    const poljeDatum = document.getElementById('polje-datum');
    const poljeCijena = document.getElementById('polje-cijena');
    const vezanaPonudaSelect = document.getElementById('input-vezana-ponuda');
    const poruka = document.getElementById('interesovanje-poruka');

    if (vezanaPonudaSelect) {
        vezanaPonudaSelect.innerHTML = '<option value="">-- Nova (početna) ponuda --</option>';
        const relevantnePonude = trenutniKorisnik && trenutniKorisnik.admin
            ? sveponude
            : sveponude.filter(p => p.mozeOdgovoriti);

        if (relevantnePonude.length === 0) {
            vezanaPonudaSelect.disabled = true;
        } else {
            vezanaPonudaSelect.disabled = false;
            relevantnePonude.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `#${p.id} — ${p.tekst.substring(0, 30)}`;
                vezanaPonudaSelect.appendChild(opt);
            });
        }
    }

    const azurirajVidljivaPolja = () => {
        const tip = tipSelect.value;
        if (poljeDatum) poljeDatum.classList.toggle('polje-skriveno', tip !== 'zahtjev');
        if (poljeCijena) poljeCijena.classList.toggle('polje-skriveno', tip !== 'ponuda');
    };
    tipSelect.addEventListener('change', azurirajVidljivaPolja);
    azurirajVidljivaPolja();

    forma.addEventListener('submit', (e) => {
        e.preventDefault();
        poruka.textContent = '';
        poruka.style.color = 'black';

        if (!trenutniKorisnik) {
            poruka.textContent = 'Morate biti prijavljeni da biste dodali interesovanje.';
            poruka.style.color = 'red';
            return;
        }

        const tip = tipSelect.value;
        const tekst = document.getElementById('input-tekst').value.trim();

        if (!tekst) {
            poruka.textContent = 'Tekst je obavezan.';
            poruka.style.color = 'red';
            return;
        }

        if (tip === 'upit') {
            PoziviAjax.postUpit(nekretninaId, tekst, (err) => {
                obradiOdgovorForme(err, poruka, nekretninaId, forma);
            });
        } else if (tip === 'zahtjev') {
            const trazeniDatum = document.getElementById('input-trazeni-datum').value;
            if (!trazeniDatum) {
                poruka.textContent = 'Traženi datum je obavezan za zahtjev.';
                poruka.style.color = 'red';
                return;
            }
            PoziviAjax.postNekretninaZahtjev(nekretninaId, { tekst, trazeniDatum }, (err) => {
                obradiOdgovorForme(err, poruka, nekretninaId, forma);
            });
        } else if (tip === 'ponuda') {
            const ponudaCijene = document.getElementById('input-cijena-ponude').value;
            const datumPonude = document.getElementById('input-datum-ponude').value;
            const idVezanePonude = vezanaPonudaSelect ? vezanaPonudaSelect.value || null : null;
            const odbijenaPonuda = document.getElementById('input-odbijena-ponuda') ? document.getElementById('input-odbijena-ponuda').checked : false;

            if (!ponudaCijene || !datumPonude) {
                poruka.textContent = 'Cijena i datum ponude su obavezni.';
                poruka.style.color = 'red';
                return;
            }

            PoziviAjax.postNekretninaPonuda(nekretninaId, {
                tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda
            }, (err) => {
                obradiOdgovorForme(err, poruka, nekretninaId, forma);
            });
        }
    });
}

function obradiOdgovorForme(err, poruka, nekretninaId, forma) {
    if (err) {
        poruka.textContent = (err && err.statusText) || 'Greška prilikom slanja.';
        poruka.style.color = 'red';
        return;
    }
    poruka.textContent = 'Uspješno poslano!';
    poruka.style.color = 'green';
    forma.reset();
    loadInteresovanja(nekretninaId);
}

// ==== KOMENTARI (Integracija) ====
function loadKomentari(nekretninaId) {
    PoziviAjax.getKorisnik((korisnikErr, korisnik) => {
        const trenutniKorisnik = korisnikErr ? null : korisnik;

        PoziviAjax.getKomentari(nekretninaId, (err, komentari) => {
            if (err) {
                console.error('Greška pri učitavanju komentara:', err);
                return;
            }
            prikaziListuKomentara(nekretninaId, komentari, trenutniKorisnik);
            setupFormaKomentar(nekretninaId);
        });
    });
}

function formatVrijeme(datumString) {
    if (!datumString) return '';
    const d = new Date(datumString);
    if (isNaN(d.getTime())) return '';
    const datum = d.toLocaleDateString('bs-BA');
    const vrijeme = d.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
    return `${datum} u ${vrijeme}`;
}

function prikaziListuKomentara(nekretninaId, komentari, trenutniKorisnik) {
    const container = document.getElementById('lista-komentara');
    if (!container) {
        console.error('Element #lista-komentara nije pronađen u HTML-u!');
        return;
    }

    // Provjera da li su komentari validan niz
    if (!Array.isArray(komentari) || komentari.length === 0) {
        container.innerHTML = '<p>Nema komentara za ovu nekretninu.</p>';
        return;
    }

    // 1. Pretvaranje ravne liste u hijerarhijsko stablo (Tree)
    const map = {};
    const korijenskiKomentari = [];

    komentari.forEach(k => {
        map[k.id] = { ...k, Odgovori: [] };
    });

    komentari.forEach(k => {
        if (k.idVezanogKomentara) {
            if (map[k.idVezanogKomentara]) {
                map[k.idVezanogKomentara].Odgovori.push(map[k.id]);
            }
        } else {
            korijenskiKomentari.push(map[k.id]);
        }
    });

    // 2. Rekurzivna funkcija za iscrtavanje komentara i svih nivoa odgovora
    function generisiHTMLKomentara(k) {
        const autor = k.Korisnik ? (k.Korisnik.ime ? `${k.Korisnik.ime} ${k.Korisnik.prezime}` : k.Korisnik.korisnickoIme) : 'Korisnik';
        const tacnoVrijeme = formatVrijeme(k.createdAt);

        let odgovoriHtml = '';
        if (k.Odgovori && k.Odgovori.length > 0) {
            odgovoriHtml = `<div class="odgovori-lista" style="margin-left: 20px; border-left: 2px solid #ccc; padding-left: 10px; margin-top: 10px;">` +
                k.Odgovori.map(odgovor => generisiHTMLKomentara(odgovor)).join('') +
                `</div>`;
        }

        return `
            <div class="komentar-item" style="border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px;" data-id="${k.id}">
                <p><strong>${autor}:</strong></p>
                <p>${k.tekst}</p>
                ${tacnoVrijeme ? `<small style="color: #666; font-size: 11px;">Objavljeno: ${tacnoVrijeme}</small>` : ''}
                
                ${odgovoriHtml}

                ${trenutniKorisnik ? `
                    <div style="margin-top: 6px;">
                        <button type="button" class="btn-otvori-odgovor" onclick="toggleFormaOdgovora(${k.id})" style="font-size: 11px; padding: 2px 6px;">Odgovori</button>
                        <form id="forma-odgovor-komentar-${k.id}" class="forma-odgovor-komentar" data-komentar-id="${k.id}" style="display: none; margin-top: 6px;">
                            <textarea rows="2" placeholder="Napišite odgovor..." required style="width: 100%;"></textarea>
                            <button type="submit" style="font-size: 11px; margin-top: 4px;">Pošalji odgovor</button>
                        </form>
                    </div>
                ` : ''}
            </div>
        `;
    }

    container.innerHTML = korijenskiKomentari.map(k => generisiHTMLKomentara(k)).join('');

    // 3. Direktno vezivanje event listenera na forme (bez suvišnog cloneNode)
    container.querySelectorAll('.forma-odgovor-komentar').forEach(forma => {
        forma.addEventListener('submit', (e) => {
            e.preventDefault();
            const komentarId = forma.dataset.komentarId;
            const textarea = forma.querySelector('textarea');
            const tekst = textarea ? textarea.value.trim() : '';
            if (!tekst) return;

            PoziviAjax.odgovoriNaKomentar(nekretninaId, komentarId, tekst, (err) => {
                if (err) {
                    alert((err && err.statusText) || JSON.stringify(err) || 'Greška pri slanju odgovora.');
                    return;
                }
                // Uspješno poslan odgovor, ponovo učitaj komentare da se osvježi prikaz
                loadKomentari(nekretninaId);
            });
        });
    });
}

function setupFormaKomentar(nekretninaId) {
    const forma = document.getElementById('forma-komentar');
    if (!forma) return;

    const novaForma = forma.cloneNode(true);
    forma.parentNode.replaceChild(novaForma, forma);

    novaForma.addEventListener('submit', (e) => {
        e.preventDefault();
        const tekstInput = document.getElementById('input-komentar-tekst');
        const poruka = document.getElementById('komentar-poruka');
        const tekst = tekstInput.value.trim();

        if (!tekst) return;

        PoziviAjax.dodajKomentar(nekretninaId, tekst, (err, noviKomentar) => {
            if (err) {
                if (poruka) {
                    poruka.textContent = (err && err.statusText) || err || 'Greška pri dodavanju komentara.';
                    poruka.style.color = 'red';
                }
                return;
            }
            if (poruka) {
                poruka.textContent = 'Komentar uspješno dodat!';
                poruka.style.color = 'green';
            }
            tekstInput.value = '';
            
            loadKomentari(nekretninaId);
        });
    });
}