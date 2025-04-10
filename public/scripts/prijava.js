window.onload =function(){
    var username=document.getElementById("username")
    var password=document.getElementById("password")
    
    let dugme=document.getElementById("dugme")
    function countdown(seconds) {
        function tick() {
          var counter = document.getElementById("areaBelow");
          seconds--;
          counter.innerHTML =
            "Moguća prijava tek za: "+"0:" + (seconds < 10 ? "0" : "") + String(seconds);
          if (seconds > 0) {
            setTimeout(tick, 1000);
          } else {
            document.getElementById("areaBelow").innerHTML = "";
          }
        }
        tick();
      }

    dugme.onclick = function(){
        
        PoziviAjax.postLogin(username.value,password.value,function(err,data){
            if(err != null){
                window.alert(err)
                if(data==429){
                    var divElement=document.getElementById("areaBelow")
                    countdown(58);
                }
            }else{
                var message=JSON.parse(data)                
                if(message.poruka=="Neuspješna prijava"){
                    var divElement=document.getElementById("areaBelow")
                    divElement.innerHTML="<h2>Neispravni podaci</h2>"
                }else{
                    window.location.href="./nekretnine.html"
                }
            }
        })
    }
}