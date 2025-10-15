let StatistikaNekretnina = function() {
    let listaNekretnina = [];

    let init = function(spisakNekretnina) {
        listaNekretnina = spisakNekretnina;
    };

    let prosjecnaKvadratura = function(kriterij) {
        let filtrirane = listaNekretnina.filter(nekretnina => {
            for (let key in kriterij) {
                if (nekretnina[key] !== kriterij[key]) {
                    return false;
                }
            }
            return true;
        });

        let ukupnaKvadratura = filtrirane.reduce((sum, nekretnina) => sum + nekretnina.kvadratura, 0);
        return filtrirane.length ? ukupnaKvadratura / filtrirane.length : 0;
    };

    let outlier = function(kriterij, nazivSvojstva) {
        let srednjaVrijednost = listaNekretnina.reduce((sum, nekretnina) => sum + nekretnina[nazivSvojstva], 0) / listaNekretnina.length;

        let filtrirane = listaNekretnina.filter(nekretnina => {
            for (let key in kriterij) {
                if (nekretnina[key] !== kriterij[key]) {
                    return false;
                }
            }
            return true;
        });

        return filtrirane.reduce((maxOutlier, nekretnina) => {
            let odstupanje = Math.abs(nekretnina[nazivSvojstva] - srednjaVrijednost);
            return (!maxOutlier || odstupanje > maxOutlier.odstupanje) ? { nekretnina, odstupanje } : maxOutlier;
        }, null)?.nekretnina || null;
    };

    let mojeNekretnine = function(korisnik) {
        return listaNekretnina
            .filter(nekretnina => nekretnina.upiti.some(upit => upit.korisnik_id === korisnik))
            .sort((a, b) => b.upiti.length - a.upiti.length);
    };

    let histogramCijena = function(periodi, rasponiCijena) {
        let rezultat = [];

        periodi.forEach((period, indeksPerioda) => {
            let nekretnineUPeriodu = listaNekretnina.filter(nekretnina => {
                let godina = parseInt(nekretnina.datum_objave.split(".")[2]);
                return godina >= period.od && godina <= period.do;
            });

            rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
                let brojNekretnina = nekretnineUPeriodu.filter(nekretnina =>
                    nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do
                ).length;

                rezultat.push({
                    indeksPerioda,
                    indeksRasponaCijena,
                    brojNekretnina
                });
            });
        });

        return rezultat;
    };

    return {
        init,
        prosjecnaKvadratura,
        outlier,
        mojeNekretnine,
        histogramCijena
    };
};
