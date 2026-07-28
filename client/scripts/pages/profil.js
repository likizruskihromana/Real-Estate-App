window.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

let trenutniKorisnik = null;

function loadUserProfile() {
    const container = document.getElementById('user-profil');

    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err) {
            window.location.href = './prijava.html';
            return;
        }

        trenutniKorisnik = korisnik;

        // Statistika (broj upita) - najbolji dostupan pokazatelj aktivnosti korisnika
        PoziviAjax.getMojiUpiti((upitiErr, data) => {
            const brojUpita = (!upitiErr && data && data.izabraniUpiti) ? data.izabraniUpiti.length : 0;
            renderViewMode(container, korisnik, brojUpita);
        });
    });
}

function inicijali(korisnik) {
    return `${(korisnik.ime || '?')[0]}${(korisnik.prezime || '?')[0]}`.toUpperCase();
}

function renderViewMode(container, korisnik, brojUpita) {
    container.innerHTML = `
        <div class="profile-header">
            <div class="avatar-krug">${inicijali(korisnik)}</div>
            <h2>${korisnik.ime} ${korisnik.prezime}</h2>
            <p class="username">@${korisnik.username}</p>
            ${korisnik.admin ? '<span class="badge-admin"><i class="fa fa-shield"></i> Administrator</span>' : '<span class="badge-user">Korisnik</span>'}
        </div>

        <div class="profile-body">
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-broj">${brojUpita}</span>
                    <span class="stat-labela">Poslanih upita</span>
                </div>
                <div class="stat-card">
                    <span class="stat-broj">${korisnik.admin ? 'Admin' : 'Standard'}</span>
                    <span class="stat-labela">Tip naloga</span>
                </div>
            </div>

            <div class="info-lista">
                <div class="info-red">
                    <span class="info-labela">Ime</span>
                    <span class="info-vrijednost">${korisnik.ime}</span>
                </div>
                <div class="info-red">
                    <span class="info-labela">Prezime</span>
                    <span class="info-vrijednost">${korisnik.prezime}</span>
                </div>
                <div class="info-red">
                    <span class="info-labela">Korisničko ime</span>
                    <span class="info-vrijednost">${korisnik.username}</span>
                </div>
                <div class="info-red">
                    <span class="info-labela">Lozinka</span>
                    <span class="info-vrijednost">••••••••</span>
                </div>
            </div>

            <button class="btn-primary" id="uredi-dugme" type="button">
                <i class="fa fa-pencil"></i> Uredi profil
            </button>
        </div>
    `;

    document.getElementById('uredi-dugme').addEventListener('click', () => {
        renderEditMode(container, korisnik);
    });
}

function renderEditMode(container, korisnik) {
    container.innerHTML = `
        <div class="profile-header">
            <div class="avatar-krug">${inicijali(korisnik)}</div>
            <h2>Uredi profil</h2>
        </div>

        <div class="profile-body">
            <div id="forma-poruka" class="forma-poruka" style="display:none;"></div>

            <form id="profileForm" class="profile-form" novalidate>
                <div class="form-group">
                    <label for="ime">Ime</label>
                    <input type="text" id="ime" value="${korisnik.ime}" required>
                    <span class="polje-greska" id="greska-ime"></span>
                </div>

                <div class="form-group">
                    <label for="prezime">Prezime</label>
                    <input type="text" id="prezime" value="${korisnik.prezime}" required>
                    <span class="polje-greska" id="greska-prezime"></span>
                </div>

                <div class="form-group">
                    <label for="username">Korisničko ime</label>
                    <input type="text" id="username" value="${korisnik.username}" required>
                    <span class="polje-greska" id="greska-username"></span>
                </div>

                <label class="promijeni-lozinku-toggle">
                    <input type="checkbox" id="zeli-promjenu-lozinke">
                    Želim promijeniti lozinku
                </label>

                <div id="polja-lozinke" class="polja-skrivena">
                    <div class="form-group">
                        <label for="password">Nova lozinka</label>
                        <input type="password" id="password" placeholder="Minimalno 6 karaktera" autocomplete="new-password">
                        <span class="polje-greska" id="greska-password"></span>
                    </div>
                    <div class="form-group">
                        <label for="password-confirm">Potvrdi novu lozinku</label>
                        <input type="password" id="password-confirm" autocomplete="new-password">
                        <span class="polje-greska" id="greska-password-confirm"></span>
                    </div>
                </div>

                <div class="forma-dugmad">
                    <button type="button" class="btn-secondary" id="otkazi-dugme">Otkaži</button>
                    <button type="submit" class="btn-primary" id="sacuvaj-dugme">Sačuvaj promjene</button>
                </div>
            </form>
        </div>
    `;

    const zeliPromjenuCheckbox = document.getElementById('zeli-promjenu-lozinke');
    const poljaLozinke = document.getElementById('polja-lozinke');
    zeliPromjenuCheckbox.addEventListener('change', () => {
        poljaLozinke.classList.toggle('polja-skrivena', !zeliPromjenuCheckbox.checked);
    });

    document.getElementById('otkazi-dugme').addEventListener('click', () => {
        renderViewMode(container, korisnik, null);
        loadUserProfile(); // osvježi stanje (uklj. broj upita) bez pretpostavki
    });

    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(container);
    });
}

function ociganiPolje(id, poruka) {
    const errEl = document.getElementById(`greska-${id}`);
    if (errEl) errEl.textContent = poruka || '';
}

function handleFormSubmit(container) {
    ['ime', 'prezime', 'username', 'password', 'password-confirm'].forEach(id => ociganiPolje(id, ''));

    const ime = document.getElementById('ime').value.trim();
    const prezime = document.getElementById('prezime').value.trim();
    const username = document.getElementById('username').value.trim();
    const zeliPromjenuLozinke = document.getElementById('zeli-promjenu-lozinke').checked;

    let ispravno = true;

    if (!ime) { ociganiPolje('ime', 'Ime je obavezno.'); ispravno = false; }
    if (!prezime) { ociganiPolje('prezime', 'Prezime je obavezno.'); ispravno = false; }
    if (!username) { ociganiPolje('username', 'Korisničko ime je obavezno.'); ispravno = false; }

    const updateData = { ime, prezime, username };

    if (zeliPromjenuLozinke) {
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        if (!Helpers.isValidPassword(password)) {
            ociganiPolje('password', 'Lozinka mora imati bar 6 karaktera.');
            ispravno = false;
        } else if (password !== passwordConfirm) {
            ociganiPolje('password-confirm', 'Lozinke se ne podudaraju.');
            ispravno = false;
        } else {
            updateData.password = password;
        }
    }

    if (!ispravno) return;

    const dugme = document.getElementById('sacuvaj-dugme');
    dugme.disabled = true;
    dugme.textContent = 'Čuvanje...';

    PoziviAjax.putKorisnik(updateData, (err, response) => {
        const poruka = document.getElementById('forma-poruka');

        if (err) {
            dugme.disabled = false;
            dugme.textContent = 'Sačuvaj promjene';
            poruka.style.display = 'block';
            poruka.className = 'forma-poruka greska';
            poruka.textContent = (err.statusText) || 'Greška prilikom ažuriranja podataka.';
            return;
        }

        trenutniKorisnik = { ...trenutniKorisnik, ime, prezime, username };
        prikaziToast('Profil je uspješno ažuriran.');
        loadUserProfile();
    });
}

function prikaziToast(tekst) {
    const toast = document.createElement('div');
    toast.className = 'profil-toast';
    toast.textContent = tekst;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('vidljiv'), 10);
    setTimeout(() => {
        toast.classList.remove('vidljiv');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
