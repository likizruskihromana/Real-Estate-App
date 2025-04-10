const PoziviAjax = (() => {

    // fnCallback se u svim metodama poziva kada stigne
    // odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data,
    // error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška, poruka se prosljeđuje u error parametru
    // callback-a, a data je tada null

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }


    // vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        let ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    console.log('Uspješan zahtjev, status 200');
                    fnCallback(null, JSON.parse(ajax.responseText));
                } else if (ajax.status == 401) {
                    console.log('Neuspješan zahtjev, status 401');
                    fnCallback("error", null);
                } else {
                    console.log('Nepoznat status:', ajax.status);
                }
            }
        };

        ajax.open("GET", "http://localhost:3000/korisnik", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send();
    }

    // ažurira podatke loginovanog korisnika
    function impl_putKorisnik(noviPodaci, fnCallback) {
        // Check if user is authenticated
        if (!req.session.username) {
            // User is not logged in
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        // Get data from request body
        const { ime, prezime, username, password } = noviPodaci;

        // Read user data from the JSON file
        const users = readJsonFile('korisnici');

        // Find the user by username
        const loggedInUser = users.find((user) => user.username === req.session.username);

        if (!loggedInUser) {
            // User not found (should not happen if users are correctly managed)
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        // Update user data with the provided values
        if (ime) loggedInUser.ime = ime;
        if (prezime) loggedInUser.prezime = prezime;
        if (username) loggedInUser.adresa = adresa;
        if (password) loggedInUser.brojTelefona = brojTelefona;

        // Save the updated user data back to the JSON file
        saveJsonFile('korisnici', users);

        fnCallback(null, { poruka: 'Podaci su uspješno ažurirani' });
    }

    // dodaje novi upit za trenutno loginovanog korisnika
    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        // Check if user is authenticated
        if (!req.session.username) {
            // User is not logged in
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        // Read user data from the JSON file asynchronously
        readJsonFileAsync('korisnici', (err, users) => {
            if (err) {
                return fnCallback({ status: 500, statusText: 'Internal Server Error' }, null);
            }

            // Read properties data from the JSON file asynchronously
            readJsonFileAsync('nekretnine', (err, nekretnine) => {
                if (err) {
                    return fnCallback({ status: 500, statusText: 'Internal Server Error' }, null);
                }

                // Find the user by username
                const loggedInUser = users.find((user) => user.username === req.session.username);

                // Check if the property with nekretnina_id exists
                const nekretnina = nekretnine.find((property) => property.id === nekretnina_id);

                if (!nekretnina) {
                    // Property not found
                    return fnCallback({ status: 400, statusText: `Nekretnina sa id-em ${nekretnina_id} ne postoji` }, null);
                }

                // Add a new query to the property's queries array
                nekretnina.upiti.push({
                    korisnik_id: loggedInUser.id,
                    tekst_upita: tekst_upita
                });

                // Save the updated properties data back to the JSON file asynchronously
                saveJsonFileAsync('nekretnine', nekretnine, (err) => {
                    if (err) {
                        return fnCallback({ status: 500, statusText: 'Internal Server Error' }, null);
                    }

                    fnCallback(null, { poruka: 'Upit je uspješno dodan' });
                });
            });
        });
    }

    function impl_getNekretnine(fnCallback) {
        ajaxRequest('GET', '/nekretnine', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, ajax.status)
            }
        }
        ajax.open("POST", "http://localhost:3000/login", true)
        ajax.setRequestHeader("Content-Type", "application/json")
        var objekat = {
            "username": username,
            "password": password
        }
        forSend = JSON.stringify(objekat)
        ajax.send(forSend)
    }

    function impl_postLogout(fnCallback) {
        let ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/logout", true)
        ajax.send()
    }

    function impl_getTop5Nekretnina(lokacija,fnCallback){
        let ajax = new XMLHttpRequest()
        ajaxRequest('GET', `http://localhost:3000/nekretnine/top5?lokacija=${lokacija}`, null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try { fnCallback(null, JSON.parse(data));} 
                    catch (parseError) { fnCallback(parseError, null); }}});
    }

    function impl_getMojiUpiti(fnCallback){
        let ajax = new XMLHttpRequest()      
        ajaxRequest('GET', 'http://localhost:3000/upiti/moji', null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try {             
                    fnCallback(null, JSON.parse(data));
                } // { id_nekretnine: nekretnine[i].id, tekst_upita: upit.tekst_upita}
                    catch (parseError) { fnCallback(parseError, null)}}})}

    function impl_getNekretnina(nekretnina_id,fnCallback){
        let ajax = new XMLHttpRequest()
        ajaxRequest('GET', `http://localhost:3000/nekretnina/${nekretnina_id}`, null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try { fnCallback(null, JSON.parse(data));} 
                    catch (parseError) { fnCallback(parseError, null); }}})}
    function impl_getNextUpiti(nekretnina_id,page,fnCallback){
        let ajax = new XMLHttpRequest()
        ajaxRequest('GET', `http://localhost:3000/next/upiti/nekretnina/${nekretnina_id}?page=${page}`, null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try { fnCallback(null, JSON.parse(data));} 
                    catch (parseError) { fnCallback(parseError, null); }}})}
    ////////////////////////////////////////////////////////////////////spirala 4
    function impl_getNekretninaInteresovanja(nekretnina_id,fnCallback){
        let ajax = new XMLHttpRequest()
        ajaxRequest('GET', `http://localhost:3000/nekretnina/${nekretnina_id}/interesovanja`, null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try { fnCallback(null, JSON.parse(data));} 
                    catch (parseError) { fnCallback(parseError, null); }}})}    
    function impl_postNekretninaPonuda(nekretnina_id,fnCallback){
        let ajax = new XMLHttpRequest()
        ajaxRequest('POST', `http://localhost:3000/nekretnina/${nekretnina_id}/ponuda`, null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try { fnCallback(null, JSON.parse(data));} 
                    catch (parseError) { fnCallback(parseError, null); }}})}   
    function impl_postNekretninaZahtjev(nekretnina_id,fnCallback){
        let ajax = new XMLHttpRequest()
        ajaxRequest('POST', `http://localhost:3000/nekretnina/${nekretnina_id}/zahtjev`, null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try { fnCallback(null, JSON.parse(data));} 
                    catch (parseError) { fnCallback(parseError, null); }}})} 
    function impl_putNekretninaZahtjevZid(nekretnina_id,zid,fnCallback){
        let ajax = new XMLHttpRequest()
        ajaxRequest('PUT', `http://localhost:3000/nekretnina/${nekretnina_id}/zahtjev/${zid}`, null, (error, data) => {
            if (error) { fnCallback(error, null); } else {
                try { fnCallback(null, JSON.parse(data));} 
                    catch (parseError) { fnCallback(parseError, null); }}})} 

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getTop5Nekretnina:impl_getTop5Nekretnina,
        getMojiUpiti:impl_getMojiUpiti,
        getNekretnina:impl_getNekretnina,
        getNextUpiti:impl_getNextUpiti,
        getNekretninaInteresovanja:impl_getNekretninaInteresovanja,
        postNekretninaPonuda:impl_postNekretninaPonuda,
        postNekretninaZahtjev:impl_postNekretninaZahtjev,
        putNekretninaZahtjevZid:impl_putNekretninaZahtjevZid
    };
})();