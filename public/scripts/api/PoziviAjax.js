const PoziviAjax = (() => {
    const API_BASE_URL = 'http://localhost:3000';

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        
        xhr.send(data ? JSON.stringify(data) : null);
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

    // INTERESOVANJA (Spirala 4)
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

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getNekretnina: impl_getNekretnina,
        getTop5Nekretnina: impl_getTop5Nekretnina,
        getMojiUpiti: impl_getMojiUpiti,
        getNextUpiti: impl_getNextUpiti,
        getNekretninaInteresovanja: impl_getNekretninaInteresovanja,
        postNekretninaPonuda: impl_postNekretninaPonuda,
        postNekretninaZahtjev: impl_postNekretninaZahtjev,
        putNekretninaZahtjevZid: impl_putNekretninaZahtjevZid
    };
})();