window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('arhiva-sadrzaj');

    PoziviAjax.getArhiva((err, nekretnine) => {
        if (err) {
            container.innerHTML = '<p class="greska-poruka">Greška pri učitavanju arhive.</p>';
            return;
        }

        if (!nekretnine || nekretnine.length === 0) {
            container.innerHTML = '<div class="prazno-stanje"><p>Još nema prodanih nekretnina u arhivi.</p></div>';
            return;
        }

        const ukupnoPromet = nekretnine.reduce((sum, n) => sum + parseFloat(n.prodajnaCijena || 0), 0);

        container.innerHTML = `
            <div class="statistike-bar">
                <div class="stat-item">
                    <span class="stat-broj">${nekretnine.length}</span>
                    <span class="stat-labela">Prodanih nekretnina</span>
                </div>
                <div class="stat-item">
                    <span class="stat-broj">${Helpers.formatPrice(ukupnoPromet)}</span>
                    <span class="stat-labela">Ukupan promet</span>
                </div>
            </div>

            <div class="arhiva-grid">
                ${nekretnine.map(n => {
                    const vlasnik = n.Korisnik ? n.Korisnik.username : '—';
                    const kupac = n.Kupac ? n.Kupac.username : '—';
                    return `
                        <div class="arhiva-kartica">
                            <div class="arhiva-kartica-header">
                                <h3>${Helpers.escapeHtml(n.naziv)}</h3>
                                <span class="oznaka-prodano-mala">PRODANO</span>
                            </div>
                            <div class="arhiva-detalji">
                                <div class="arhiva-red">
                                    <span class="arhiva-labela">Tip:</span>
                                    <span>${n.tip_nekretnine}</span>
                                </div>
                                <div class="arhiva-red">
                                    <span class="arhiva-labela">Lokacija:</span>
                                    <span>${Helpers.escapeHtml(n.lokacija)}</span>
                                </div>
                                <div class="arhiva-red">
                                    <span class="arhiva-labela">Kvadratura:</span>
                                    <span>${n.kvadratura} m²</span>
                                </div>
                                <div class="arhiva-red">
                                    <span class="arhiva-labela">Objavljena cijena:</span>
                                    <span>${Helpers.formatPrice(n.cijena)}</span>
                                </div>
                                <div class="arhiva-red prodajna">
                                    <span class="arhiva-labela">Prodajna cijena:</span>
                                    <span class="prodajna-cijena">${Helpers.formatPrice(n.prodajnaCijena)}</span>
                                </div>
                                <div class="arhiva-red">
                                    <span class="arhiva-labela">Datum prodaje:</span>
                                    <span>${Helpers.formatDate(n.datumKupovine)}</span>
                                </div>
                                <div class="arhiva-red">
                                    <span class="arhiva-labela">Prodavac:</span>
                                    <span>@${vlasnik}</span>
                                </div>
                                <div class="arhiva-red">
                                    <span class="arhiva-labela">Kupac:</span>
                                    <span>@${kupac}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    });
});
