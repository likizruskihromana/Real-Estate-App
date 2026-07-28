window.addEventListener('DOMContentLoaded', () => {
    const forma = document.getElementById('registerForm');
    const dugme = document.getElementById('dugme');
    const areaBelow = document.getElementById('areaBelow');

    forma.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });

    function handleRegister() {
        const ime = document.getElementById('ime').value.trim();
        const prezime = document.getElementById('prezime').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        if (!ime || !prezime || !username || !password) {
            showError('Sva polja su obavezna.');
            return;
        }

        if (!Helpers.isValidPassword(password)) {
            showError('Lozinka mora imati bar 6 karaktera.');
            return;
        }

        if (password !== passwordConfirm) {
            showError('Lozinke se ne podudaraju.');
            return;
        }

        dugme.disabled = true;
        dugme.textContent = 'Registracija...';

        PoziviAjax.postRegister({ ime, prezime, username, password }, (err) => {
            dugme.disabled = false;
            dugme.textContent = 'Registruj se';

            if (err) {
                showError(err.statusText || 'Greška prilikom registracije.');
                return;
            }

            areaBelow.innerHTML = '<p class="success-message">Uspješna registracija! Preusmjeravanje...</p>';
            setTimeout(() => {
                window.location.href = './';
            }, 500);
        });
    }

    function showError(message) {
        areaBelow.innerHTML = `<p class="error-message">${message}</p>`;
    }
});
