document.addEventListener("DOMContentLoaded", () => {


    let spisak = SpisakNekretnina(); 
    spisak.init(listaNekretnina, listaKorisnika); 

    let statistika = StatistikaNekretnina(); 
    statistika.init(spisak.filtrirajNekretnine({})); 


    let periodi = [];
    let rasponiCijena = [];

    const primijeniFilter = () => {
        const kriteriji = {
            tip_nekretnine: document.getElementById("filter-tip-nekretnine").value || null,
            min_kvadratura: parseInt(document.getElementById("filter-min-kvadratura").value) || null,
            max_kvadratura: parseInt(document.getElementById("filter-max-kvadratura").value) || null,
            min_cijena: parseInt(document.getElementById("filter-min-cijena").value) || null,
            max_cijena: parseInt(document.getElementById("filter-max-cijena").value) || null,
            tip_grijanja: document.getElementById("filter-tip-grijanja").value || null,
            lokacija: document.getElementById("filter-lokacija").value || null,
            godina_izgradnje: parseInt(document.getElementById("filter-godina-izgradnje").value) || null,
            datum_objave: document.getElementById("filter-datum-objave").value || null,
        };        const filtriraneNekretnine = spisak.filtrirajNekretnine(kriteriji);
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
        const rezultati = statistika.histogramCijena(periodi, rasponiCijena);

        const chartDiv = document.getElementById("histogram-charts");
        chartDiv.innerHTML = ""; // Očisti prethodne grafove

        periodi.forEach((period, index) => {
            const canvas = document.createElement("canvas");
            chartDiv.appendChild(canvas);

            const podaci = rezultati
                .filter(r => r.indeksPerioda === index)
                .map(r => r.brojNekretnina);

            const labels = rasponiCijena.map((_, i) => `Raspon ${i + 1}`);

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
        const kriterij = {};
        const prosjek = statistika.prosjecnaKvadratura(kriterij);
        document.getElementById("prosjek-kvadratura").textContent = prosjek.toFixed(2);
    };

    const prikaziOutlier = () => {
        const nazivSvojstva = "cijena"; 
        const kriterij = {}; 
        const outlier = statistika.outlier(kriterij, nazivSvojstva);
        document.getElementById("outlier").textContent = outlier 
            ? `${outlier.naziv} (${outlier[nazivSvojstva]})` 
            : "Nema podataka.";
    };

    const prikaziMojeNekretnine = () => {
        const korisnik = listaKorisnika[0]; 
        const mojeNekretnine = statistika.mojeNekretnine(korisnik.id);
        document.getElementById("moje-nekretnine").textContent = mojeNekretnine
            .map(n => n.naziv)
            .join(", ");
    };

    document.getElementById("primijeni-filter").addEventListener("click", primijeniFilter);
    document.getElementById("dodaj-period").addEventListener("click", dodajPeriod);
    document.getElementById("dodaj-raspon").addEventListener("click", dodajRasponCijena);
    document.getElementById("iscrtaj-histogram").addEventListener("click", iscrtajHistogram);

    prikaziProsjekKvadratura();
    prikaziOutlier();
    prikaziMojeNekretnine();
});

const listaNekretnina = [{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2023.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 32000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2009.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2003.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},
{
    id: 2,
    tip_nekretnine: "KuÄ‡a",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 3,
    tip_nekretnine: "KuÄ‡a",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 4,
    tip_nekretnine: "KuÄ‡a",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
}]

const listaKorisnika = [{
    id: 1,
    ime: "Neko",
    prezime: "Nekic",
    username: "username1",
},
{
    id: 2,
    ime: "Neko2",
    prezime: "Nekic2",
    username: "username2",
}]