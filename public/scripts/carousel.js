function postaviCarousel(glavniElement, sviElementi, indeks = 0) {
    if (!glavniElement || !sviElementi || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }
    const azurirajPrikaz = () => {
        glavniElement.innerHTML = sviElementi[indeks].innerHTML;
    };
    azurirajPrikaz();
    const fnLijevo = () => {
        if(indeks===0){
            indeks = sviElementi.length-1;
        }else{
            indeks = indeks-1;
        }
        azurirajPrikaz();
    };
    const fnDesno = () => {
        if(indeks==sviElementi.length-1){
            indeks = 0;
        }else{
            indeks = indeks+1;
        }
        azurirajPrikaz();
    };

    return { fnLijevo, fnDesno };
}
