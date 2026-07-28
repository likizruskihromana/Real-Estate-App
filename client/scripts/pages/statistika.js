document.addEventListener("DOMContentLoaded", () => {

    let statistika = StatistikaNekretnina();
    let trenutniKorisnik = null;
    let sveNekretnine = [];

    let periodi = [];
    let rasponiCijena = [];

    function filtrirajNekretnine(kriterij) {
        return sveNekretnine.filter(nekretnina => {
            if (kriterij.tip_nekretnine && nekretnina.tip_nekretnine !== kriterij.tip_nekretnine) return false;
            if (kriterij.min_kvadratura && nekretnina.kvadratura < kriterij.min_kvadratura) return false;
            if (kriterij.max_kvadratura && nekretnina.kvadratura > kriterij.max_kvadratura) return false;
            if (kriterij.min_cijena && nekretnina.cijena < kriterij.min_cijena) return false;
            if (kriterij.max_cijena && nekretnina.cijena > kriterij.max_cijena) return false;
            if (kriterij.tip_grijanja && nekretnina.tip_grijanja !== kriterij.tip_grijanja) return false;
            if (kriterij.lokacija && nekretnina.lokacija !== kriterij.lokacija) return false;
            if (kriterij.godina_izgradnje && nekretnina.godina_izgradnje !== kriterij.godina_izgradnje) return false;
            if (kriterij.datum_objave && nekretnina.datum_objave !== kriterij.datum_objave) return false;
            return true;
        });
    }

    // Učitaj prave podatke sa servera (nekretnine + trenutni korisnik)
    function ucitajPodatke() {
        PoziviAjax.getNekretnine((err, nekretnine) => {
            if (err) {
                console.error('Greška pri učitavanju nekretnina:', err);
                return;
            }
            sveNekretnine = nekretnine;

            PoziviAjax.getKorisnik((korisnikErr, korisnik) => {
                trenutniKorisnik = korisnikErr ? null : korisnik;

                statistika.init(filtrirajNekretnine({}));

                prikaziProsjekKvadratura();
                prikaziOutlier();
                prikaziMojeNekretnine();
            });
        });
    }

    const vrijednostFiltera = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };

    const primijeniFilter = () => {
        const kriteriji = {
            tip_nekretnine: vrijednostFiltera("filter-tip-nekretnine") || null,
            min_kvadratura: parseInt(vrijednostFiltera("filter-min-kvadratura")) || null,
            max_kvadratura: parseInt(vrijednostFiltera("filter-max-kvadratura")) || null,
            min_cijena: parseInt(vrijednostFiltera("filter-min-cijena")) || null,
            max_cijena: parseInt(vrijednostFiltera("filter-max-cijena")) || null,
            lokacija: vrijednostFiltera("filter-lokacija") || null,
        };
        const filtriraneNekretnine = filtrirajNekretnine(kriteriji);
        console.log("Filtrirane nekretnine:", filtriraneNekretnine);

        statistika.init(filtriraneNekretnine);

        prikaziProsjekKvadratura();
        prikaziOutlier();
        prikaziMojeNekretnine();
    };

    const dodajPeriod = () => {
        const od = parseInt(document.getElementById("period-od").value);
        const doGodine = parseInt(document.getElementById("period-do").value);

        if (od && doGodine && od <= doGodine) {
            periodi.push({ od, do: doGodine });
            alert(`Dodali ste period: ${od}-${doGodine}`);
        } else {
            alert("Unesite ispravan period.");
        }
    };

    const dodajRasponCijena = () => {
        const od = parseInt(document.getElementById("cijena-od").value);
        const doCijena = parseInt(document.getElementById("cijena-do").value);

        if (od && doCijena && od <= doCijena) {
            rasponiCijena.push({ od, do: doCijena });
            alert(`Dodali ste raspon cijena: ${od}-${doCijena}`);
        } else {
            alert("Unesite ispravan raspon cijena.");
        }
    };

    const iscrtajHistogram = () => {
        if (periodi.length === 0 || rasponiCijena.length === 0) {
            alert("Dodajte bar jedan period i jedan raspon cijena prije iscrtavanja.");
            return;
        }

        const rezultati = statistika.histogramCijena(periodi, rasponiCijena);

        const chartDiv = document.getElementById("histogram-charts");
        chartDiv.innerHTML = ""; // Očisti prethodne grafove

        periodi.forEach((period, index) => {
            const canvas = document.createElement("canvas");
            chartDiv.appendChild(canvas);

            const podaci = rezultati
                .filter(r => r.indeksPerioda === index)
                .map(r => r.brojNekretnina);

            const labels = rasponiCijena.map((r, i) => `${r.od}-${r.do} KM`);

            new Chart(canvas, {
                type: "bar",
                data: {
                    labels,
                    datasets: [{
                        label: `Period: ${period.od}-${period.do}`,
                        data: podaci,
                        backgroundColor: "rgba(75, 192, 192, 0.5)"
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true },
                    },
                },
            });
        });
    };

    const prikaziProsjekKvadratura = () => {
        const prosjek = statistika.prosjecnaKvadratura({});
        document.getElementById("prosjek-kvadratura").textContent = prosjek.toFixed(2);
    };

    const prikaziOutlier = () => {
        const nazivSvojstva = "cijena";
        const outlier = statistika.outlier({}, nazivSvojstva);
        document.getElementById("outlier").textContent = outlier
            ? `${outlier.naziv} (${Helpers.formatPrice(outlier[nazivSvojstva])})`
            : "Nema podataka.";
    };

    const prikaziMojeNekretnine = () => {
        const container = document.getElementById("moje-nekretnine");

        if (!trenutniKorisnik) {
            container.textContent = "Prijavite se da biste vidjeli svoje nekretnine.";
            return;
        }

        // mojeNekretnine treba niz nekretnina koje imaju .upiti (sa korisnik_id)
        // Dohvatimo sve upite za trenutno filtrirane nekretnine paralelno
        const nekretnineZaProvjeru = filtrirajNekretnine({});
        if (nekretnineZaProvjeru.length === 0) {
            container.textContent = "Nema nekretnina za prikaz.";
            return;
        }

        let obradjeno = 0;
        const upitiPoNekretnini = {};

        nekretnineZaProvjeru.forEach((nekretnina) => {
            PoziviAjax.getNekretninaInteresovanja(nekretnina.id, (err, interesovanja) => {
                obradjeno++;
                upitiPoNekretnini[nekretnina.id] = (!err && interesovanja && interesovanja.upiti)
                    ? interesovanja.upiti.map(u => ({ korisnik_id: u.KorisnikId, tekst_upita: u.tekst }))
                    : [];

                if (obradjeno === nekretnineZaProvjeru.length) {
                    const saUpitima = nekretnineZaProvjeru.map(n => ({
                        ...n,
                        upiti: upitiPoNekretnini[n.id] || []
                    }));

                    statistika.init(saUpitima);
                    const mojeNekretnine = statistika.mojeNekretnine(trenutniKorisnik.id);
                    container.textContent = mojeNekretnine.length
                        ? mojeNekretnine.map(n => n.naziv).join(", ")
                        : "Nemate upita ni na jednoj nekretnini.";
                    // Vrati statistiku na filtrirani skup za ostale prikaze
                    statistika.init(nekretnineZaProvjeru);
                }
            });
        });
    };

    document.getElementById("primijeni-filter").addEventListener("click", primijeniFilter);
    document.getElementById("dodaj-period").addEventListener("click", dodajPeriod);
    document.getElementById("dodaj-raspon").addEventListener("click", dodajRasponCijena);
    document.getElementById("iscrtaj-histogram").addEventListener("click", iscrtajHistogram);

    ucitajPodatke();
});
