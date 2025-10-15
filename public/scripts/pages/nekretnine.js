window.addEventListener('DOMContentLoaded', () => {
    loadNekretnine();
});

async function loadNekretnine() {
    Helpers.showLoading(document.body);

    PoziviAjax.getNekretnine((err, nekretnine) => {
        Helpers.hideLoading(document.body);

        if (err) {
            Helpers.handleError(err, document.body);
            return;
        }

        const spisak = SpisakNekretnina();
        spisak.init(nekretnine, []);

        renderNekretnineByType(spisak, 'Stan', 'stan');
        renderNekretnineByType(spisak, 'Kuća', 'kuca');
        renderNekretnineByType(spisak, 'Poslovni prostor', 'pp');
    });
}

function renderNekretnineByType(spisak, tip, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const gridContainer = container.querySelector('.grid-lista-nekretnina');
    if (!gridContainer) return;

    const filtrirane = spisak.filtrirajNekretnine({ tip_nekretnine: tip });

    gridContainer.innerHTML = '';

    if (filtrirane.length === 0) {
        gridContainer.innerHTML = '<p>Nema dostupnih nekretnina.</p>';
        return;
    }

    filtrirane.forEach(nekretnina => {
        const card = createNekretninaCard(nekretnina);
        gridContainer.appendChild(card);
    });
}

function createNekretninaCard(nekretnina) {
    const div = document.createElement('div');
    div.className = 'nekretnina';

    div.innerHTML = `
        <img class="slika-nekretnine" src="../resources/stan1.jpg" alt="${nekretnina.naziv}">
        <div class="detalji-nekretnine">
            <h3>${nekretnina.naziv}</h3>
            <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
        </div>
        <div class="cijena-nekretnine">
            <p>Cijena: ${Helpers.formatPrice(nekretnina.cijena)}</p>
        </div>
        <a href="detalji.html?id=${nekretnina.id}" class="detalji-dugme">Detalji</a>
    `;

    return div;
}