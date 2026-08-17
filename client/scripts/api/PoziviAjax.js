const PoziviAjax = (() => {
    const API_BASE_URL = window.location.origin;
    function getCookie(name) {
        const prefix = `${name}=`;
        const cookie = document.cookie.split(';').map(dio => dio.trim()).find(dio => dio.startsWith(prefix));
        return cookie ? decodeURIComponent(cookie.substring(prefix.length)) : '';
    }
    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
            xhr.setRequestHeader('X-CSRF-Token', getCookie('nekretnine.csrf'));
        }
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    callback(null, xhr.responseText);
                } else {
                    let statusText = xhr.statusText;
                    try {
                        const parsed = JSON.parse(xhr.responseText);
                        if (parsed && parsed.greska) statusText = parsed.greska;
                    } catch (e) {
                        // odgovor nije JSON, koristi se podrazumijevani statusText
                    }
                    callback({ status: xhr.status, statusText }, null);
                }
            }
        };
        
        xhr.send(data ? JSON.stringify(data) : null);
    }
    function ajaxFormRequest(method, url, formData, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('X-CSRF-Token', getCookie('nekretnine.csrf'));
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            let odgovor = null;
            try { odgovor = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch (_error) {}
            if (xhr.status >= 200 && xhr.status < 300) callback(null, odgovor);
            else callback({ status: xhr.status, statusText: odgovor?.greska || xhr.statusText }, null);
        };
        xhr.send(formData);
    }
    // AUTH
    function impl_postLogin(username, password, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/auth/login`, 
            { username, password }, 
            fnCallback
        );
    }
    function impl_postLogout(fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/auth/logout`, null, fnCallback);
    }
    function impl_postRegister(regData, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/auth/register`, regData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    // KORISNIK
    function impl_getKorisnik(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/korisnik`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_putKorisnik(noviPodaci, fnCallback) {
        ajaxRequest('PUT', `${API_BASE_URL}/api/korisnik`, noviPodaci, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    // NEKRETNINE
    function impl_getNekretnine(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/nekretnine`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getPonude(fnCallback){
        ajaxRequest('GET', `${API_BASE_URL}/api/ponude`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getNekretnina(nekretnina_id, fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getTop5Nekretnina(lokacija, fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/nekretnine/top5?lokacija=${encodeURIComponent(lokacija)}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_postNekretnina(nekretninaData, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/nekretnine`, nekretninaData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getMojeNekretnine(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/nekretnine/moje`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_putNekretnina(nekretnina_id, nekretninaData, fnCallback) {
        ajaxRequest('PUT', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}`, nekretninaData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_deleteNekretnina(nekretnina_id, fnCallback) {
        ajaxRequest('DELETE', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_uploadSlikaNekretnine(nekretnina_id, file, fnCallback) {
        const formData = new FormData();
        formData.append('slika', file);
        ajaxFormRequest('POST', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}/slike`, formData, fnCallback);
    }
    function impl_postaviGlavnuSliku(nekretnina_id, slika_id, fnCallback) {
        ajaxRequest('PATCH', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}/slike/${slika_id}/glavna`, {}, (error, data) => {
            if (error) return fnCallback(error, null);
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_obrisiSlikuNekretnine(nekretnina_id, slika_id, fnCallback) {
        ajaxRequest('DELETE', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}/slike/${slika_id}`, null, (error, data) => {
            if (error) return fnCallback(error, null);
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    // ADMIN
    function impl_getAdminKorisnici(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/admin/korisnici`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_patchAdminStatus(korisnik_id, admin, fnCallback) {
        ajaxRequest('PATCH', `${API_BASE_URL}/api/admin/korisnici/${korisnik_id}/admin`, { admin }, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_deleteAdminKorisnik(korisnik_id, fnCallback) {
        ajaxRequest('DELETE', `${API_BASE_URL}/api/admin/korisnici/${korisnik_id}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getAdminNekretnine(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/admin/nekretnine`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getAdminZahtjevi(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/admin/zahtjevi`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    // UPITI
    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/upiti`, 
            { nekretnina_id, tekst_upita }, 
            (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        fnCallback(null, JSON.parse(data));
                    } catch (e) {
                        fnCallback(e, null);
                    }
                }
            }
        );
    }
    function impl_putUpitOdgovor(upit_id, odgovor, fnCallback) {
        ajaxRequest('PUT', `${API_BASE_URL}/api/upiti/${upit_id}`, { odgovor }, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getMojiUpiti(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/upiti/moji`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_getNextUpiti(nekretnina_id, page, fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/upiti/next/${nekretnina_id}?page=${page}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    // INTERESOVANJA
    function impl_getNekretninaInteresovanja(nekretnina_id, fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}/interesovanja`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_postNekretninaPonuda(nekretnina_id, ponudaData, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/ponude/${nekretnina_id}`, ponudaData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_postNekretninaZahtjev(nekretnina_id, zahtjevData, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/zahtjevi/${nekretnina_id}`, zahtjevData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_putNekretninaZahtjevZid(nekretnina_id, zid, updateData, fnCallback) {
        ajaxRequest('PUT', `${API_BASE_URL}/api/zahtjevi/${nekretnina_id}/${zid}`, updateData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }
    function impl_odgovoriNaPonudu(idPonude, odbijenaPonuda, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4) {
                if (ajax.status === 200) {
                    try {
                        var jsonRez = JSON.parse(ajax.responseText);
                        callback(null, jsonRez);
                    } catch (err) {
                        callback("Greška pri parsiranju JSON-a", null);
                    }
                } else {
                    try {
                        var errJson = JSON.parse(ajax.responseText);
                        callback(errJson.greska || "Došlo je do greške", null);
                    } catch (e) {
                        callback("Greška na serveru: " + ajax.status, null);
                    }
                }
            }
        };
        ajax.open("PUT", `${API_BASE_URL}/api/ponude/${idPonude}`, true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.setRequestHeader('X-CSRF-Token', getCookie('nekretnine.csrf'));
        ajax.send(JSON.stringify({ odbijenaPonuda: odbijenaPonuda }));
    }

    // KOMENTARI
    function impl_getKomentari(nekretnina_id, fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}/komentari`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }

    function impl_dodajKomentar(nekretnina_id, tekst, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}/komentar`, { tekst }, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }

    function impl_odgovoriNaKomentar(nekretnina_id, komentar_id, tekst, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/nekretnine/${nekretnina_id}/komentar/${komentar_id}/odgovor`, { tekst }, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    fnCallback(null, JSON.parse(data));
                } catch (e) {
                    fnCallback(e, null);
                }
            }
        });
    }

    function impl_prihvatiPonudu(ponuda_id, fnCallback) {
        ajaxRequest('PUT', `${API_BASE_URL}/api/ponude/${ponuda_id}/prihvati`, {}, (error, data) => {
            if (error) { fnCallback(error, null); return; }
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_obrisiKomentar(komentar_id, fnCallback) {
        ajaxRequest('DELETE', `${API_BASE_URL}/api/admin/komentari/${komentar_id}`, null, (error, data) => {
            if (error) { fnCallback(error, null); return; }
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_getMojePonude(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/ponude/moje`, null, (error, data) => {
            if (error) { fnCallback(error, null); return; }
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_getAdminDashboard(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/admin/dashboard`, null, (error, data) => {
            if (error) { fnCallback(error, null); return; }
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_getAdminKomentari(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/admin/komentari`, null, (error, data) => {
            if (error) { fnCallback(error, null); return; }
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_getAdminPonude(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/admin/ponude`, null, (error, data) => {
            if (error) { fnCallback(error, null); return; }
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_getArhiva(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/nekretnine/arhiva`, null, (error, data) => {
            if (error) { fnCallback(error, null); return; }
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_getSacuvano(fnCallback) {
        ajaxRequest('GET', `${API_BASE_URL}/api/sacuvano`, null, (error, data) => {
            if (error) return fnCallback(error, null);
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_dodajOmiljenu(nekretnina_id, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/sacuvano/omiljene/${nekretnina_id}`, {}, (error, data) => {
            if (error) return fnCallback(error, null);
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_ukloniOmiljenu(nekretnina_id, fnCallback) {
        ajaxRequest('DELETE', `${API_BASE_URL}/api/sacuvano/omiljene/${nekretnina_id}`, null, (error, data) => {
            if (error) return fnCallback(error, null);
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_sacuvajPretragu(podaci, fnCallback) {
        ajaxRequest('POST', `${API_BASE_URL}/api/sacuvano/pretrage`, podaci, (error, data) => {
            if (error) return fnCallback(error, null);
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }
    function impl_obrisiSacuvanuPretragu(pretraga_id, fnCallback) {
        ajaxRequest('DELETE', `${API_BASE_URL}/api/sacuvano/pretrage/${pretraga_id}`, null, (error, data) => {
            if (error) return fnCallback(error, null);
            try { fnCallback(null, JSON.parse(data)); } catch (e) { fnCallback(e, null); }
        });
    }

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        postRegister: impl_postRegister,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        putUpitOdgovor: impl_putUpitOdgovor,
        getNekretnine: impl_getNekretnine,
        getNekretnina: impl_getNekretnina,
        getTop5Nekretnina: impl_getTop5Nekretnina,
        postNekretnina: impl_postNekretnina,
        getMojeNekretnine: impl_getMojeNekretnine,
        putNekretnina: impl_putNekretnina,
        deleteNekretnina: impl_deleteNekretnina,
        uploadSlikaNekretnine: impl_uploadSlikaNekretnine,
        postaviGlavnuSliku: impl_postaviGlavnuSliku,
        obrisiSlikuNekretnine: impl_obrisiSlikuNekretnine,
        getMojiUpiti: impl_getMojiUpiti,
        getNextUpiti: impl_getNextUpiti,
        getNekretninaInteresovanja: impl_getNekretninaInteresovanja,
        postNekretninaPonuda: impl_postNekretninaPonuda,
        postNekretninaZahtjev: impl_postNekretninaZahtjev,
        putNekretninaZahtjevZid: impl_putNekretninaZahtjevZid,
        getPonude: impl_getPonude,
        getMojePonude: impl_getMojePonude,
        prihvatiPonudu: impl_prihvatiPonudu,
        obrisiKomentar: impl_obrisiKomentar,
        getAdminKorisnici: impl_getAdminKorisnici,
        patchAdminStatus: impl_patchAdminStatus,
        deleteAdminKorisnik: impl_deleteAdminKorisnik,
        getAdminNekretnine: impl_getAdminNekretnine,
        getAdminZahtjevi: impl_getAdminZahtjevi,
        getAdminDashboard: impl_getAdminDashboard,
        getAdminKomentari: impl_getAdminKomentari,
        getAdminPonude: impl_getAdminPonude,
        getArhiva: impl_getArhiva,
        getSacuvano: impl_getSacuvano,
        dodajOmiljenu: impl_dodajOmiljenu,
        ukloniOmiljenu: impl_ukloniOmiljenu,
        sacuvajPretragu: impl_sacuvajPretragu,
        obrisiSacuvanuPretragu: impl_obrisiSacuvanuPretragu,
        odgovoriNaPonudu: impl_odgovoriNaPonudu,
        getKomentari: impl_getKomentari,
        dodajKomentar: impl_dodajKomentar,
        odgovoriNaKomentar: impl_odgovoriNaKomentar
    };
})();
