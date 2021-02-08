var express=require('express')// import modulul express
var path= require('path');
var app=express();//aici am creat serverul
var mysql=require('mysql');
const formidable=require('formidable')
const session = require('express-session')
const crypto = require('crypto');
const nodemailer = require("nodemailer");

const _md5 = require('md5');
var fs=require('fs');

app.use(express.static(path.join(__dirname, "poze_uploadate")));





//setez o sesiune

app.use(session({
	secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
	resave: true,
	saveUninitialized: false
  }));
  


//functii utile

function getUtiliz(req){
	var utiliz;
	if(req.session){
		utiliz=req.session.utilizator
	}
	else{utiliz=null}
	return utiliz;
}




var conexiune=mysql.createConnection({
	host:"localhost",
	user:"gigel",
	password:"Gigel.123",
	database:"proiect_tw"
	


});

conexiune.connect(function(err){
	if (err) throw err;
	console.log("Ne-am conectat!!! Yayyyy!!");
});

conexiune.query("select * from produse",function(err, rezultat, campuri){
	if(err) throw err;
	console.log(rezultat);
});





app.set('view engine', 'ejs');//setez drept compilator de template-uri ejs (setez limbajul in care vor fi scrise template-urile)


console.log(__dirname); //predefinita - calea pe masina serverului
console.log(path.join(__dirname, "resurse"));
// /stiluri/stil.css
app.use(express.static(path.join(__dirname, "resurse")));

// cand se face o cerere get catre pagina de index 
app.get('/', function(req, res) {
	if (req.session){
		console.log(req.session.utilizator);

		res.render('pagini/index', {utilizator:req.session.utilizator});
	}
	else{
		res.render('pagini/index');
	}
	
	
	
});



/*
// aici astept cereri de forma localhost:8080 (fara nimic dupa)
app.get('/', function(req, res){
	res.render('pagini/index');//afisez index-ul in acest caz
});
/*
app.post("/inreg", function(req,res){
	var formular=formidable.IncomingForm()
	console.log("am intrat pe post");
	formular.parse(req, function)

})*/



app.get('/produse', function(req, res){
	var a="ionel";
	var b="17";
	conexiune.query("select * from produse",function(err, rezultat, campuri){
		if(err) throw err;
		console.log(rezultat);
		res.render('pagini/produse',{param_a:a, param_b:b, produse:rezultat});//afisez index-ul in acest caz
	});

});


app.get('/prod/pret/:min/:max', function(req, res){

	var pretMin=req.params.min;
	var pretMax=req.params.max;
	conexiune.query("select * from produse where pret > "+pretMin+" and pret <"+pretMax ,function(err, rezultat, campuri){
		if(err) throw err;
		console.log(rezultat);
		res.render('pagini/produse',{produse:rezultat});//afisez index-ul in acest caz
	});

});

app.get('/elem_:abc', function(req, res){
	var idProd=req.params.abc;
	conexiune.query("select * from produse where id="+idProd,function(err, rezultat, campuri){
		if(err) throw err;
		console.log(rezultat);
		res.render('pagini/pag_produs',{ produs_unic:rezultat[0]});//afisez index-ul in acest caz
	});

});





//cerere serviciu
// Luni, 9 noiembrie, 2020, ora: hh:mm:ss
//si luna sa fie scrisa cu bold <b>
app.get('/ora_server', function(req, res){
	res.setHeader("Content-Type", "text/html");
	res.write("<html><body><p style='color:red;'>Salut, Gigele!</p>");
	var d=new Date();
	//res.write(d+""); conversie implicita la sir
	res.write(d.getFullYear()+"/"+d.getMonth());
	res.write("</body></html>");
	res.end();
});


/*
//aici astept orice tip de cerere (caracterul special * care tine loc de orice sir)
app.get('/*', function(req, res){
	
	res.render('pagini/'+req.url, function(err, rezRandare){
		if(err){//intra doar cand avem eroare
			if(err.message.includes("Failed to lookup view"))
				res.status(404).render('pagini/404');
			else
				throw err;
		}
		else{
			console.log(rezRandare);
			res.send(rezRandare);
		}
	});//afisez pagina ceruta dupa localhost:8080
	//de exemplu pentru localhost:8080/pag2 va afisa fisierul /pag2 din folderul pagini
	console.log(req.url);//afisez in consola url-ul pentru verificare
});

app.listen(8080);//serverul asculta pe portul 8080
console.log("A pornit serverul pe portul 8080");//afisez in consola un mesaj sa stiu ca nu s-a blocat
*/







//ingregistrare






async function trimiteMail(username, email){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{//date login 
			user:"customwise.orders@gmail.com",
			pass:"NumberPower30"
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	//genereaza html
	await transp.sendMail({
		from:"customwise.orders@gmail.com",
		to:email,
		subject:"Cont nou",
		text:"Bine ai venit in comunitatea Customwise. Username-ul tau este "+username,
		html:"<h1>Bine ai venit in comunitatea Customwise!</h1><p>Username-ul tau este <span style=\"color:green;font-weight: bold\">"+username+"</span> </p>",
	})
	console.log("trimis mail");
}

async function trimiteMailStergere(email){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{//date login 
			user:"customwise.orders@gmail.com",
			pass:"NumberPower30"
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	//genereaza html
	await transp.sendMail({
		from:"customwise.orders@gmail.com",
		to:email,
		subject:"Cont sters",
		text:"Cu sinceră părere de rău, vă anunțăm că ați fost șters! Adio ",
		html:"<h1>Customwise</h1><p>Cu sinceră părere de rău, vă anunțăm că ați fost șters! Adio </p>",
	})
	console.log("trimis mail stergere cont");
}















var parolaServer="tehniciweb";
app.post("/inreg",function(req, res){
	var username;
	var cale_imagine = null;
	var formular= formidable.IncomingForm()
	console.log("am intrat pe post");
	
	//nr ordine: 4
	formular.parse(req, function(err, campuriText, campuriFisier){//se executa dupa ce a fost primit formularul si parsat
		console.log("parsare")
		var eroare="";
		console.log(campuriText);
		//verificari campuri
		if(campuriText.username==""){
			eroare+="Username nesetat <br> ";
		}
		if(campuriText.nume==""){
			eroare+="Nume necompletat <br> ";
		}
		if(campuriText.prenume==""){
			eroare+="Prenume necompletat <br> ";
		}
		if(campuriText.email==""){
			eroare+="Email necompletat <br>";
		}
		if(campuriText.parola==""){
			eroare+="Parola necompletata <br> ";
		}
		if(campuriText.rparola==""){
			eroare+="Reintroduceti parola. Parolele nu corespund <br> ";
		}
		/*SQL Injection -Laboratorul din 6.01.2021*/

		if(eroare==""){
			unescapedUsername= campuriText.username
			unescapedEmail= campuriText.email

			campuriText.username=mysql.escape(campuriText.username)
			campuriText.nume=mysql.escape(campuriText.nume)
			campuriText.prenume=mysql.escape(campuriText.prenume)
			campuriText.email=mysql.escape(campuriText.email)
			campuriText.ocupatie=mysql.escape(campuriText.ocupatie)
			campuriText.cale_imagine=mysql.escape(campuriText.cale_imagine)
			
			var parolaCriptata=_md5(mysql.escape(campuriText.parola));// crypto.scryptSync(campuriText.parola,parolaServer,32).toString("ascii"); 
			parolaCriptata=mysql.escape(parolaCriptata)
//escape pune niste apostrofuri la inceput si la sfarsitul campului
// verificare daca exista deja username-ul in tabelul de utilizatori
//ne intereseaza sa vedem ca lungimea vectorului intors este zero=> nu exista utilizator

	var preluare=`select id from utilizatori where username= ${campuriText.username}`
	conexiune.query(preluare, function(err, rez, campuri){
		if (err) {
			console.log(err);
			throw err;
		}
		if(rez.length!=0){
			eroare+="Username deja existent <br>";
			//res.render("pagini/inregistrare_user",{err:eroare,raspuns:"Completati corect campurile"});

		}
		else{

		
				//daca nu am erori procesez campurile
				var cale_tabel=username+"/"+campuriFisier.poza.name

				
							var comanda=`insert into utilizatori (nume, prenume, username,parola, ocupatie, email, cale_imagine) values( ${campuriText.nume}, ${campuriText.prenume},  ${campuriText.username},  ${parolaCriptata},  ${campuriText.ocupatie}, ${campuriText.email}, '${cale_tabel}' )`;
							console.log(comanda);
							conexiune.query(comanda, function(err, rez, campuri){
								if (err) {
									console.log(err);
									throw err;
								}
								trimiteMail(unescapedUsername,unescapedEmail);
								console.log("ceva");
								res.render("pagini/inregistrare_user",{err:"",raspuns:"Date introduse"});
							})
						}
						
						})
					}
					else{
						res.render("pagini/inregistrare_user",{err:eroare,raspuns:"Completati corect campurile"});
					}
				})
/*
		if(conexiune.query("select * from utilizatori where username = '" +campuriText.username +"'")== campuriText.username)
		{
			eroare+="userul exista";
		}*/
	
	


		

	//nr ordine: 1
	formular.on("field", function(name,field){
		if(name=='username')
		if(!(field.includes('\\')|| field.includes('/')))
			username=field;
		else{
			username="defaultFolder";
		}
		console.log("camp - field:", name)
	});
	
	//nr ordine: 2
	formular.on("fileBegin", function(name,campFisier){
		console.log("inceput upload: ", campFisier);
		if(campFisier && campFisier.name!=""){
			//am  fisier transmis
			var cale=__dirname+"/poze_uploadate/"+username
			var cale_tabel=username+"/"+campFisier.nume

			if (!fs.existsSync(cale))
				fs.mkdirSync(cale);
			campFisier.path=cale+"/"+campFisier.name;
			console.log(campFisier.path);
			cale_imagine = mysql.escape(campFisier.path);

			var comanda=`update utilizatori set cale_imagine='${cale_tabel}' where username=${username}`;
			console.log(comanda);
			conexiune.query(comanda, function(err, rez, campuri){ });
		}
	});
	
	//nr ordine: 3
	formular.on("file", function(name,field){
		console.log("final upload: ", name);
	});
});

//-------------------------------- logare si delogare utilizator ---------------------------------------


app.post("/login",function(req, res){
	var formular= formidable.IncomingForm()
	console.log("am intrat pe login");
	
	formular.parse(req, function(err, campuriText, campuriFisier){//se executa dupa ce a fost primit formularul si parsat
		var parolaCriptata=  _md5(mysql.escape(campuriText.parola));//crypto.scryptSync(campuriText.parola,parolaServer,32).toString("ascii");
		campuriText.username=mysql.escape(campuriText.username)
		var comanda=`select rol, email, cale_imagine from utilizatori where username=${campuriText.username} and parola='${parolaCriptata}'`;
		conexiune.query(comanda, function(err, rez, campuri){
			console.log(comanda);
			if(rez && rez.length==1){
				console.log("am intrat pe if");
				req.session.utilizator={
					rol:rez[0].rol,
					username:campuriText.username,
					email:rez[0].email,
					cale_imagine:rez[0].cale_imagine
				}
				console.log("am iesit din if");
				res.render("pagini/index",{utilizator:req.session.utilizator});
			}
			else{
				res.render("pagini/index");
			}
		});
	});
});

app.get('/logout', function(req, res){
	console.log("logout");
	req.session.destroy();
	res.render("pagini/index");
});


//-------------------------------- actiunile admin-ului: afisare si stergere utilizator ---------------------------------------

app.get('/useri', function(req, res){
	
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
	conexiune.query("select * from utilizatori",function(err, rezultat, campuri){
		if(err) throw err;
		console.log(rezultat);
		res.render('pagini/useri',{useri:rezultat, utilizator:getUtiliz(req)});//afisez index-ul in acest caz
	});
	} else{
		res.render('pagini/eroare',{mesaj:"Nu aveti acces", utilizator:req.session.utilizator});
	}

});

app.post("/sterge_utiliz",function(req, res){
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
	var formular= formidable.IncomingForm()
	console.log("am intrat pe login");
	
	
	formular.parse(req, function(err, campuriText, campuriFisier){
		var comanda = `select * from utilizatori where id='${campuriText.id_utiliz}'`;
		conexiune.query(comanda, function(err, rez, campuri){
			//console.log(comanda,campuri,rez)
			var cale = __dirname+"/poze_uploadate"+"/"+rez[0]["cale_imagine"];
			var id = rez[0]["id"];
			var email = rez[0]["email"]+"";
			console.log(email);
			if(cale){
				fs.unlinkSync(cale);
	
			}
			if(id){
				var comanda=`delete from utilizatori where id='${campuriText.id_utiliz}'`;
				conexiune.query(comanda, function(err, rez, campuri){
					//mesaj cu stergerea
					if(!err)
						trimiteMailStergere(email)
				});
			}
		})
	});
	}
	res.redirect('/useri');
	//res.render("pagini/index",{utilizator:req.session.utilizator});
	
});















app.get('/*', function(req, res){
	var utiliz;
	if(req.session){
		utiliz=req.session.utilizator
	}
	else{utiliz=null}
  
	res.render('pagini' + req.url,{utilizator:utiliz}, function(err, rezRandare){
		  if(err){
				  if(err.message.indexOf("Failed to lookup view")!=-1){
					  res.status(404).render("pagini/404", {utilizator:utiliz})
		  
				  }
		  else throw err
		  }
	  else res.send(rezRandare)
	  });
  });
  
app.listen(8080);
console.log('Serverul a pornit pe portul 8080');
