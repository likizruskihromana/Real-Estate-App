window.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const dugme = document.getElementById('dugme');
    const areaBelow = document.getElementById('areaBelow');

    dugme.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Enter key support
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Unesite username i password');
            return;
        }

        dugme.disabled = true;
        dugme.textContent = 'Prijavljivanje...';

        PoziviAjax.postLogin(username, password, (err, response) => {
            dugme.disabled = false;
            dugme.textContent = 'Login';

            if (err) {
                handleLoginError(err);
            } else {
                handleLoginSuccess(response);
            }
        });
    }

    function handleLoginError(err) {
        if (err === 429 || (err.status && err.status === 429)) {
            startCountdown(60);
        } else {
            showError('Neispravni kredencijali');
        }
    }

    function handleLoginSuccess(response) {
        try {
            const data = JSON.parse(response);
            if (data.poruka === 'Uspješna prijava') {
                areaBelow.innerHTML = '<p class="success">Uspješna prijava! Preusmjeravanje...</p>';
                setTimeout(() => {
                    window.location.href = './nekretnine.html';
                }, 500);
            } else {
                showError('Neispravni podaci');
            }
        } catch (e) {
            showError('Greška pri obradi odgovora');
        }
    }

    function showError(message) {
        areaBelow.innerHTML = `<p class="error">${message}</p>`;
    }

    function startCountdown(seconds) {
        const interval = setInterval(() => {
            seconds--;
            areaBelow.innerHTML = `<p class="warning">Pokušajte ponovo za: ${seconds}s</p>`;

            if (seconds <= 0) {
                clearInterval(interval);
                areaBelow.innerHTML = '';
            }
        }, 1000);
    }
});