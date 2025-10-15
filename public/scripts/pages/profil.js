window.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    setupProfileForm();
});

function loadUserProfile() {
    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err) {
            window.location.href = './prijava.html';
            return;
        }

        displayUserInfo(korisnik);
    });
}

function displayUserInfo(korisnik) {
    const container = document.querySelector('.user-profil');
    if (!container) return;

    container.innerHTML = `
        <div class="profile-header">
            <img src="../resources/ostalo/profile-image.jpg" alt="Profil" class="user-slika">
            <h2>${korisnik.ime} ${korisnik.prezime}</h2>
            <p class="username">@${korisnik.username}</p>
            ${korisnik.admin ? '<span class="badge-admin">Admin</span>' : ''}
        </div>
        
        <form id="profileForm" class="profile-form">
            <div class="form-group">
                <label for="ime">Ime:</label>
                <input type="text" id="ime" value="${korisnik.ime}" required>
            </div>
            
            <div class="form-group">
                <label for="prezime">Prezime:</label>
                <input type="text" id="prezime" value="${korisnik.prezime}" required>
            </div>
            
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" value="${korisnik.username}" required>
            </div>
            
            <div class="form-group">
                <label for="password">Nova Lozinka:</label>
                <input type="password" id="password" placeholder="Ostavite prazno ako ne želite promijeniti">
            </div>
            
            <button type="submit" class="btn-primary">Sačuvaj Promjene</button>
        </form>
    `;

    setupProfileForm();
}

function setupProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const updateData = {
            ime: document.getElementById('ime').value,
            prezime: document.getElementById('prezime').value,
            username: document.getElementById('username').value,
        };

        const password = document.getElementById('password').value;
        if (password) {
            updateData.password = password;
        }

        PoziviAjax.putKorisnik(updateData, (err, response) => {
            if (err) {
                alert('Greška pri ažuriranju podataka');
            } else {
                alert('Podaci uspješno ažurirani!');
                window.location.reload();
            }
        });
    });
}