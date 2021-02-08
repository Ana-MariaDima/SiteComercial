      window.onload=function(){
          document.body.className=localStorage.getItem('butontema');

          var linkuriMeniu=document.querySelectorAll("ul.menu a");
          var locatie=window.location.pathname
          locatie= (locatie=="/")? "/index.html" :locatie;
          var lochash=window.location.hash
          for(var link of linkuriMeniu){
            link.style.backgroundColor="#c2c2d6";
            if(link.href.endsWith(locatie)){
              link.style.backgroundColor="grey";
            }
         
		link.onclick=function(){
			var chMenu=document.getElementById("ch-menu");
			chMenu.checked=false;
			var chSubmeniu=document.getElementsByClassName("ch-submenu");//o colectie de checkboxuri
			for(var chs of chSubmeniu){
				chs.checked=false;
			}
		}



	}
}
      function f(x){
        document.body.className= (document.body.className=="light") ? "dark" : "light";
        localStorage.setItem('butontema',document.body.className);
    

         x.classList.toggle("fa-sun");
      }

