document.addEventListener("DOMContentLoaded", () => {
    // Prvo dobijamo podatke o ulogovanom korisniku da znamo njegov ID
    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err) {
            // Ako nije ulogovan, preskačemo ili tretiramo kao gostiju
            korisnik = { id: null };
        }

        PoziviAjax.getPonude((err, ponude) => {
            if (err) {
                Helpers.handleError(err, document.body);
                return;
            }

            PoziviAjax.getNekretnine((err, nekretnine) => {
                if (err) {
                    Helpers.handleError(err, document.body);
                    return;
                }

                ponude.forEach(p => {
                    p.nekretnina = nekretnine.find(n => n.id === p.NekretninaId);
                });

                const mainOffer = ponude.reduce((max, p) =>
                    parseFloat(p.cijenaPonude) > parseFloat(max.cijenaPonude) ? p : max, ponude[0]
                );

                if (!mainOffer) return;

                // Provjera da li je ulogovani korisnik vlasnik nekretnine glavne ponude
                const jeVlasnikGlavne = korisnik.id && mainOffer.nekretnina && mainOffer.nekretnina.KorisnikId === korisnik.id;

                const mainOfferContainer = document.querySelector(".mainOffer");
                mainOfferContainer.innerHTML = `
                    <div class="offer-card main-card ${mainOffer.odbijenaPonuda ? 'rejected' : ''}">                
                        <a href="./detalji.html/?id=${mainOffer.NekretninaId}">      
                            <h2>${mainOffer.nekretnina?.naziv || "Nepoznata nekretnina"}</h2>
                            <p><strong>Lokacija:</strong> ${mainOffer.nekretnina?.lokacija || "N/A"}</p>
                            <p><strong>Cijena ponude:</strong> ${mainOffer.cijenaPonude} KM</p>
                            <p><strong>Opis ponude:</strong> ${mainOffer.tekst}</p>
                            <p><strong>Datum ponude:</strong> ${new Date(mainOffer.datumPonude).toLocaleDateString("bs-BA")}</p>
                            <p><strong>Kvadratura:</strong> ${mainOffer.nekretnina?.kvadratura || "N/A"} m²</p>
                            <p><strong>Tip grijanja:</strong> ${mainOffer.nekretnina?.tip_grijanja || "N/A"}</p>
                        </a>
                        ${jeVlasnikGlavne ? `
                            <div class="offer-actions">
                                <button class="btn-action btn-accept" data-id="${mainOffer.id}">Prihvati</button>
                                <button class="btn-action btn-reject" data-id="${mainOffer.id}">Odbij</button>
                            </div>
                        ` : ''}
                    </div>
                `;

                // Ispis ostalih ponuda
                const smallOffersContainer = document.querySelector(".smallOffer");
                const otherOffers = ponude.filter(p => p.id !== mainOffer.id);
                
                if (otherOffers.length === 0) {
                    smallOffersContainer.innerHTML = '<p class="no-offers">Nema drugih ponuda</p>';
                } else {
                    smallOffersContainer.innerHTML = otherOffers
                        .map(p => {
                            const jeVlasnikMale = korisnik.id && p.nekretnina && p.nekretnina.KorisnikId === korisnik.id;
                            return `
                                <div class="offer-card small-card ${p.odbijenaPonuda ? 'rejected' : ''}">
                                    <a href="./detalji.html/?id=${p.NekretninaId}">      
                                        <div class="small-card-content">
                                            <h3>${p.nekretnina?.naziv || "Nepoznata nekretnina"}</h3>
                                            <div>
                                                <p><strong>Lokacija:</strong> ${p.nekretnina?.lokacija || "N/A"}</p>
                                                <p><strong>Cijena:</strong> ${p.cijenaPonude} KM</p>
                                                <p><strong>Datum:</strong> ${new Date(p.datumPonude).toLocaleDateString("bs-BA")}</p>
                                                <p class="offer-text">${p.tekst}</p>
                                            </div>
                                        </div>
                                    </a>
                                    ${jeVlasnikMale ? `
                                        <div class="offer-actions">
                                            <button class="btn-action btn-accept" data-id="${p.id}">Prihvati</button>
                                            <button class="btn-action btn-reject" data-id="${p.id}">Odbij</button>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        })
                        .join("");
                }
            });
        });
    });

    // Event delegacija ostaje ista
    document.getElementById("offers").addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-action")) {
            e.preventDefault();
            const ponudaId = e.target.getAttribute("data-id");
            const isAccept = e.target.classList.contains("btn-accept");
            const statusOdbijena = !isAccept; 

            PoziviAjax.odgovoriNaPonudu(ponudaId, statusOdbijena, (err, response) => {
                if (err) {
                    alert("Greška: " + err);
                } else {
                    alert(isAccept ? "Uspješno prihvaćena ponuda!" : "Uspješno odbijena ponuda!");
                    location.reload();
                }
            });
        }
    });
});