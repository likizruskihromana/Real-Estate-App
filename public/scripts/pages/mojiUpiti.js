window.onload = () => {
    const dugme = document.getElementById('dugme');
    const demo = document.getElementById('demo');

    dugme.addEventListener('click', () => {
        PoziviAjax.getMojiUpiti((err, data) => {
            if (err) {
                demo.innerHTML = '<p class="error">Greška pri učitavanju upita</p>';
                return;
            }

            const { izabraniUpiti } = data;
            
            if (!izabraniUpiti || izabraniUpiti.length === 0) {
                demo.innerHTML = '<p>Nemate nijedan upit.</p>';
                return;
            }

            demo.innerHTML = '<h3>Vaši upiti:</h3>';
            izabraniUpiti.forEach(upit => {
                demo.innerHTML += `
                    <div class="upit-item">
                        <p><strong>Nekretnina ID:</strong> ${upit.id_nekretnine}</p>
                        <p><strong>Tekst:</strong> ${upit.tekst_upita}</p>
                    </div>
                `;
            });
        });
    });
};