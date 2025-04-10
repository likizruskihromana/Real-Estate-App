window.onload =  async () => {
    const nekretninaId = 1;
    let nekretnina=new Object()
    PoziviAjax.getNekretnina(nekretninaId,async function(err,data){
        if(err != null){
            window.alert(err)
        }else{
            nekretnina=await data
        }})
        const resolveAfter = (value, delay) =>
            new Promise(resolve => {
              setTimeout(() => resolve(value), delay);
            });
            let broj_upita
            PoziviAjax.getNekretnine(async (err,data) => {
                if(err != null){
                    console.log(err)
                }else{
                    await data
                    const temp_nekretnina=data.find((nekretnina) =>{return nekretnina.id===nekretninaId})
                    if(temp_nekretnina.upiti.length)
                        broj_upita=temp_nekretnina.upiti.length
                    else
                        broj_upita=0
                }
            })
        await  resolveAfter('Hello', 500);
            if (nekretnina) {
                document.getElementById('osnovno').innerHTML = `
                    <img src="../resources/stan1.jpg" alt="Nekretnina">
                    <p><strong>Naziv:</strong> ${nekretnina.naziv}</p>
                    <p><strong>Kvadratura:</strong> ${nekretnina.kvadratura} m²</p>
                    <p><strong>Cijena:</strong> ${nekretnina.cijena} KM</p>
                `;
                document.getElementById('detalji').innerHTML = `
                    <div id="kolona1">
                        <p><strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}</p>
                        <a id="lokacijaLink"href=""><p><strong>Lokacija:</strong> ${nekretnina.lokacija}</p></a>
                    </div>
                    <div id="kolona2">
                        <p><strong>Godina izgradnje:</strong> ${nekretnina.godina_izgradnje}</p>
                        <p><strong>Datum objave oglasa:</strong> ${nekretnina.datum_objave}</p>
                    </div>
                    <div id="opis">
                        <p><strong>Opis:</strong> ${nekretnina.opis}</p>
                    </div>
                `;
            } else {
                document.getElementById('osnovno').innerHTML = "Nekretnina nije pronađena.";
            }
        
    // Dohvati Top 5 nekretnina prema lokaciji
    const lokacija = nekretnina.lokacija; // Ovo bi moglo biti dinamički određeno
    const lokacijaLink=document.getElementById("lokacijaLink");

    if (lokacijaLink) {
        lokacijaLink.addEventListener("click", async(event) => {
        event.preventDefault();
        let top5nekretnina
        PoziviAjax.getTop5Nekretnina(lokacija, async (err,data)=>{
            if(err != null){
                window.alert(err)
            }else{
                top5nekretnina=await data
            }
        })
        await  resolveAfter('Hello', 400);
        //Napiši ovdje šta uraditi sa top 5 nekretnina koje dobiješ
        const listaNekretninaDiv = document.getElementById("lista-nekretnina");
        listaNekretninaDiv.innerHTML = ""; // Očisti prethodne rezultate

        top5nekretnina.forEach(nekretnina => {
            const nekretninaDiv = document.createElement("div");
            nekretninaDiv.classList.add("nekretnina-item");
            nekretninaDiv.innerHTML = `
                <p><strong>Naziv:</strong> ${nekretnina.naziv}</p>
                <p><strong>Lokacija:</strong> ${nekretnina.lokacija}</p>
                <p><strong>Cijena:</strong> ${nekretnina.cijena} KM</p>
            `;
            listaNekretninaDiv.appendChild(nekretninaDiv);
        });
    })}

    const glavniElement = document.querySelector("#upiti"); 
    const sviElementi = document.querySelectorAll("#upiti .upit"); 
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    for(let i=0;i<3;i++){
        if(nekretnina.upiti[i]){
        sviElementi[i].innerHTML=`<p>${nekretnina.upiti[i].korisnik_id} : ${nekretnina.upiti[i].tekst_upita}</p>`
    }
    }

    if (!glavniElement || !sviElementi.length || !prevBtn || !nextBtn) {
        console.error("Carousel elementi nisu pravilno pronađeni.");
        return;
    }
    // page * 3, page * 3+3

    
    function postaviCarousel(glavniElement, sviElementi, indeks) {
        if (!glavniElement || !sviElementi || sviElementi.length === 0) {
            return null;
        }
        const azurirajPrikaz = () => {
            glavniElement.innerHTML = 
            sviElementi[0].innerHTML + 
            sviElementi[1].innerHTML +
            sviElementi[2].innerHTML;
        };
        azurirajPrikaz();
        const fnLijevo =async () => {
            indeks = indeks-1;
            if(indeks===0)
                indeks=Math.round(broj_upita/3)

            let upiti
            PoziviAjax.getNextUpiti(nekretninaId,indeks,async (err,data) => {
                if(err != null){
                    console.log(err)
                    if(err.status===404){
                        upiti=new Array()
                        indeks=Math.round(broj_upita/3)
                    }
                }else{
                    upiti=await data
                }
            })
            await resolveAfter('Hello', 100);
                for(let j=0;j<upiti.length;j++){
                    let postoji=false
                    for(let i=0;i<nekretnina.upiti.length;i++)
                        if(nekretnina.upiti[i].korisnik_id === upiti[j].korisnik_id && nekretnina.upiti[i].tekst_upita === upiti[j].tekst_upita)
                            postoji=true
                    if(postoji){
                        continue
                    }
                    nekretnina.upiti.push(upiti[j])
                    }
                    for(let i=0;i<3;i++){
                        if(upiti[i]){
                        sviElementi[i].innerHTML=`<p>${upiti[i].korisnik_id} : ${upiti[i].tekst_upita}</p>`
                        }else{
                            sviElementi[i].innerHTML=`<p></p>`
                        }
                    }
                azurirajPrikaz();
        };


        const fnDesno = async () => {
            indeks = indeks+1;
            if(indeks===Math.round(broj_upita/3)+1)
                indeks=1
            let upiti
            PoziviAjax.getNextUpiti(nekretninaId,indeks,async (err,data) => {
                if(err != null){
                    console.log(err)
                    if(err.status===404){
                        upiti=new Array()
                        indeks=1
                    }
                }else{
                    upiti=await data
                }
            })
            await resolveAfter('Hello', 400);
                for(let j=0;j<upiti.length;j++){
                    let postoji=false
                    for(let i=0;i<nekretnina.upiti.length;i++)
                        if(nekretnina.upiti[i].korisnik_id === upiti[j].korisnik_id && nekretnina.upiti[i].tekst_upita === upiti[j].tekst_upita)
                            postoji=true
                    if(postoji){
                        continue
                    }
                    nekretnina.upiti.push(upiti[j])
                    }
                    for(let i=0;i<3;i++){
                        if(upiti[i]){
                        sviElementi[i].innerHTML=`<p>${upiti[i].korisnik_id} : ${upiti[i].tekst_upita}</p>`
                        }else{
                            sviElementi[i].innerHTML=`<p></p>`
                        }
                    }
                azurirajPrikaz();
            
        };
    
        return { fnLijevo, fnDesno };
    }
    let index=Math.round(broj_upita/3)
    const carousel = postaviCarousel(glavniElement, Array.from(sviElementi),index);
    
    if (carousel) {
        prevBtn.addEventListener("click", carousel.fnLijevo);
        nextBtn.addEventListener("click", carousel.fnDesno);
    }
};
