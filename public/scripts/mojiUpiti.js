window.onload =function(){
    let dugme=document.getElementById("dugme")
    dugme.onclick = function(){
        //data=[{nekretnina_id,text_upita}]
    PoziviAjax.getMojiUpiti(function(err,data){
            if(err != null){
                window.alert(err)
            }else{
                let izabraniUpiti=data.izabraniUpiti
                var demo = document.getElementById("demo");
                izabraniUpiti.forEach(
                    ({id_nekretnine,tekst_upita}) => demo.innerHTML += "<br>" +"Id nekretnine:" +id_nekretnine+" "+"Moji upiti za tu nekretninu"+Object.values(tekst_upita).join(""));            
            }})}
}