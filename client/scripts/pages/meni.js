window.onload = function () {
  // Funkcija za ažuriranje menija na osnovu statusa prijave
  function updateMenuForLoginStatus(loggedIn, isAdmin) {
    // Pronađite HTML elemente menija koje želite ažurirati
    const profilLink = document.getElementById('profilLink');
    const nekretnineLink = document.getElementById('nekretnineLink');
    const prijavaLink = document.getElementById('prijavaLink');
    const registracijaLink = document.getElementById('registracijaLink');
    const adminLink = document.getElementById('adminLink');
    const ponudeLink = document.getElementById('ponudeLink');
    const statistikaLink = document.getElementById('statistikaLink');
    const odjavaLink = document.getElementById('odjavaLink');
    const mojiUpitiLink = document.getElementById('mojiUpitiLink')
    const pocetnaLink = document.getElementById('pocetnaLink')
    // Ako je korisnik prijavljen, pokažite opciju "Profil", inače pokažite opcije "Nekretnine", "Prijava" i "Registracija"
    if (loggedIn) {
      profilLink.style.display = 'block';
      nekretnineLink.style.display = 'block';
      prijavaLink.style.display = 'none';
      registracijaLink.style.display = 'none';
      adminLink.style.display = isAdmin ? 'block' : 'none';
      ponudeLink.style.display = 'block';
      statistikaLink.style.display = 'block';
      odjavaLink.style.display = 'block';
      mojiUpitiLink.style.display = 'block';
      pocetnaLink.style.display = 'block';
    } else {
      pocetnaLink.style.display = 'block';
      profilLink.style.display = 'none';
      nekretnineLink.style.display = 'none';
      prijavaLink.style.display = 'block';
      registracijaLink.style.display = 'block';
      adminLink.style.display = 'none';
      ponudeLink.style.display = 'block';
      statistikaLink.style.display = 'none';
      odjavaLink.style.display = 'none';
      mojiUpitiLink.style.display = 'none';
    }
  }

  // Pozivajte metodu za dobijanje korisnika kad se stranica učita
  PoziviAjax.getKorisnik(function (err, data) {
    // Ako postoji greška prilikom dobijanja korisnika, postavite loggedIn na false
    const loggedIn = !(err || !data || !data.username);

    // Ažurirajte meni na osnovu statusa prijave korisnika
    updateMenuForLoginStatus(loggedIn, loggedIn && !!data.admin);
  });
  const odjavaLink = document.getElementById('odjavaLink');
  odjavaLink.addEventListener('click', function () {
    PoziviAjax.postLogout(function (err, data) {
      if (err != null) {
        window.alert(err);
      } else {
        window.top.location.href = "./prijava.html";
      }
      updateMenuForLoginStatus(false, false);
    });
  });
};