document.addEventListener("DOMContentLoaded", () => {

    PoziviAjax.getPonude(async (err, ponude) => {
        if (err) {
            Helpers.handleError(err, document.body);
            return;
        }

        PoziviAjax.getNekretnine(async (err, nekretnine) => {
            if (err) {
                Helpers.handleError(err, document.body);
                return;
            }

            ponude.forEach(p => {
                p.nekretnina = nekretnine.find(n => n.id === p.NekretninaId);
            });

            const mainOffer = ponude.reduce((max, p) =>
                parseFloat(p.cijenaPonude) > parseFloat(max.cijenaPonude) ? p : max
            );

            // Ispis glavne ponude 
            const mainOfferContainer = document.querySelector(".mainOffer");
            mainOfferContainer.innerHTML = `
                    <div class="offer-card main-card">                
                        <a href="./detalji.html/?id=${mainOffer.NekretninaId}">       
                            <h2>${mainOffer.nekretnina?.naziv || "Nepoznata nekretnina"}</h2>
                            <p><strong>Lokacija:</strong> ${mainOffer.nekretnina?.lokacija || "N/A"}</p>
                            <p><strong>Cijena ponude:</strong> ${mainOffer.cijenaPonude} KM</p>
                            <p><strong>Opis ponude:</strong> ${mainOffer.tekst}</p>
                            <p><strong>Datum ponude:</strong> ${new Date(mainOffer.datumPonude).toLocaleDateString("bs-BA")}</p>
                            <p><strong>Kvadratura:</strong> ${mainOffer.nekretnina?.kvadratura || "N/A"} m²</p>
                            <p><strong>Tip grijanja:</strong> ${mainOffer.nekretnina?.tip_grijanja || "N/A"}</p>
                        </a>
                    </div>
            `;

            // Ispis ostalih ponuda
            const smallOffersContainer = document.querySelector(".smallOffer");
            const otherOffers = ponude.filter(p => p.id !== mainOffer.id);
            
            if (otherOffers.length === 0) {
                smallOffersContainer.innerHTML = '<p class="no-offers">Nema drugih ponuda</p>';
            } else {
                smallOffersContainer.innerHTML = otherOffers
                    .map(p => `
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
                        </div>
                    `)
                    .join("");
            }
        });
    });
});