document.addEventListener("DOMContentLoaded", () => {
    let statistika = StatistikaNekretnina();
    let trenutniKorisnik = null;
    let sveNekretnine = [];
    let grafikonTip = null;
    let grafikonLokacija = null;
    let periodi = [];
    let rasponiCijena = [];

    function filtrirajNekretnine(kriterij) {
        return sveNekretnine.filter(n => {
            if (kriterij.tip_nekretnine && n.tip_nekretnine !== kriterij.tip_nekretnine) return false;
            if (kriterij.min_kvadratura && n.kvadratura < kriterij.min_kvadratura) return false;
            if (kriterij.max_kvadratura && n.kvadratura > kriterij.max_kvadratura) return false;
            if (kriterij.min_cijena && n.cijena < kriterij.min_cijena) return false;
            if (kriterij.max_cijena && n.cijena > kriterij.max_cijena) return false;
            if (kriterij.lokacija && n.lokacija !== kriterij.lokacija) return false;
            return true;
        });
    }

    function ucitajPodatke() {
        PoziviAjax.getNekretnine((err, nekretnine) => {
            if (err) { console.error('Greška:', err); return; }
            sveNekretnine = nekretnine;

            PoziviAjax.getKorisnik((kErr, korisnik) => {
                trenutniKorisnik = kErr ? null : korisnik;

                const filtered = filtrirajNekretnine({});
                statistika.init(filtered);

                iscrtajSazetakKartice(filtered);
                iscrtajGrafikonPoTipu(filtered);
                iscrtajGrafikonPoLokaciji(filtered);
                azurirajRezultate(filtered);
            });
        });
    }

    function iscrtajSazetakKartice(nekretnine) {
        const prosjecnaCijena = nekretnine.length
            ? nekretnine.reduce((s, n) => s + parseFloat(n.cijena), 0) / nekretnine.length
            : 0;
        const minCijena = nekretnine.length ? Math.min(...nekretnine.map(n => parseFloat(n.cijena))) : 0;
        const maxCijena = nekretnine.length ? Math.max(...nekretnine.map(n => parseFloat(n.cijena))) : 0;

        document.getElementById('stats-kartice').innerHTML = `
            <div class="stats-kartica">
                <span class="stats-broj">${nekretnine.length}</span>
                <span class="stats-labela">Ukupno nekretnina</span>
            </div>
            <div class="stats-kartica">
                <span class="stats-broj">${Helpers.formatPrice(prosjecnaCijena)}</span>
                <span class="stats-labela">Prosječna cijena</span>
            </div>
            <div class="stats-kartica zelena">
                <span class="stats-broj">${Helpers.formatPrice(minCijena)}</span>
                <span class="stats-labela">Najniža cijena</span>
            </div>
            <div class="stats-kartica narandzasta">
                <span class="stats-broj">${Helpers.formatPrice(maxCijena)}</span>
                <span class="stats-labela">Najviša cijena</span>
            </div>
        `;
    }

    function iscrtajGrafikonPoTipu(nekretnine) {
        const tipovi = {};
        nekretnine.forEach(n => { tipovi[n.tip_nekretnine] = (tipovi[n.tip_nekretnine] || 0) + 1; });

        const ctx = document.getElementById('grafikon-tip');
        if (!ctx) return;
        if (grafikonTip) grafikonTip.destroy();

        grafikonTip = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(tipovi),
                datasets: [{ data: Object.values(tipovi), backgroundColor: ['#4a4fb8','#ff9900','#2f9e44','#d64545'] }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

    function iscrtajGrafikonPoLokaciji(nekretnine) {
        const lokacije = {};
        nekretnine.forEach(n => {
            if (!lokacije[n.lokacija]) lokacije[n.lokacija] = { suma: 0, broj: 0 };
            lokacije[n.lokacija].suma += parseFloat(n.cijena);
            lokacije[n.lokacija].broj++;
        });

        const labels = Object.keys(lokacije);
        const prosjeci = labels.map(l => Math.round(lokacije[l].suma / lokacije[l].broj));

        const ctx = document.getElementById('grafikon-lokacija');
        if (!ctx) return;
        if (grafikonLokacija) grafikonLokacija.destroy();

        grafikonLokacija = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Prosječna cijena (KM)',
                    data: prosjeci,
                    backgroundColor: 'rgba(74,79,184,0.6)',
                    borderColor: '#4a4fb8',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    function azurirajRezultate(nekretnine) {
        statistika.init(nekretnine);
        const prosjek = statistika.prosjecnaKvadratura({});
        document.getElementById('prosjek-kvadratura').textContent = prosjek.toFixed(1);

        const outlier = statistika.outlier({}, 'cijena');
        document.getElementById('outlier').textContent = outlier
            ? `${outlier.naziv} (${Helpers.formatPrice(outlier.cijena)})`
            : 'Nema podataka';

        if (trenutniKorisnik) {
            const moje = statistika.mojeNekretnine(trenutniKorisnik.id);
            document.getElementById('moje-nekretnine').textContent = moje.length
                ? moje.map(n => n.naziv).join(', ')
                : 'Nema';
        } else {
            document.getElementById('moje-nekretnine-wrap').style.display = 'none';
        }
    }

    // Filter
    document.getElementById('primijeni-filter').addEventListener('click', () => {
        const k = {
            tip_nekretnine: document.getElementById('filter-tip-nekretnine').value || null,
            min_kvadratura: parseInt(document.getElementById('filter-min-kvadratura').value) || null,
            max_kvadratura: parseInt(document.getElementById('filter-max-kvadratura').value) || null,
            min_cijena: parseInt(document.getElementById('filter-min-cijena').value) || null,
            max_cijena: parseInt(document.getElementById('filter-max-cijena').value) || null,
            lokacija: document.getElementById('filter-lokacija').value || null,
        };
        const filtrirane = filtrirajNekretnine(k);
        iscrtajSazetakKartice(filtrirane);
        iscrtajGrafikonPoTipu(filtrirane);
        iscrtajGrafikonPoLokaciji(filtrirane);
        azurirajRezultate(filtrirane);
    });

    // Histogram
    document.getElementById('dodaj-period').addEventListener('click', () => {
        const od = parseInt(document.getElementById('period-od').value);
        const do_ = parseInt(document.getElementById('period-do').value);
        if (!od || !do_ || od > do_) { alert('Unesite ispravan period.'); return; }
        periodi.push({ od, do: do_ });
        const lista = document.getElementById('periodi-lista');
        lista.innerHTML += `<span class="oznaka-lista">${od}–${do_}</span>`;
    });

    document.getElementById('dodaj-raspon').addEventListener('click', () => {
        const od = parseInt(document.getElementById('cijena-od').value);
        const do_ = parseInt(document.getElementById('cijena-do').value);
        if (!od || !do_ || od > do_) { alert('Unesite ispravan raspon.'); return; }
        rasponiCijena.push({ od, do: do_ });
        const lista = document.getElementById('rasponi-lista');
        lista.innerHTML += `<span class="oznaka-lista">${Helpers.formatPrice(od)}–${Helpers.formatPrice(do_)}</span>`;
    });

    document.getElementById('iscrtaj-histogram').addEventListener('click', () => {
        if (!periodi.length || !rasponiCijena.length) {
            alert('Dodajte bar jedan period i jedan raspon cijena.'); return;
        }
        statistika.init(filtrirajNekretnine({}));
        const rezultati = statistika.histogramCijena(periodi, rasponiCijena);
        const chartDiv = document.getElementById('histogram-charts');
        chartDiv.innerHTML = '';

        periodi.forEach((period, idx) => {
            const canvas = document.createElement('canvas');
            chartDiv.appendChild(canvas);
            const podaci = rasponiCijena.map((_, ri) => {
                const r = rezultati.find(r => r.indeksPerioda === idx && r.indeksRaspona === ri);
                return r ? r.brojNekretnina : 0;
            });
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: rasponiCijena.map(r => `${Helpers.formatPrice(r.od)}–${Helpers.formatPrice(r.do)}`),
                    datasets: [{ label: `${period.od}–${period.do}`, data: podaci, backgroundColor: 'rgba(255,153,0,0.6)', borderColor: '#ff9900', borderWidth: 1 }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });
        });
    });

    ucitajPodatke();
});
