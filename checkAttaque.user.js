// ==UserScript==
// @name        CheckAttaque
// @namespace   groslapin_s_136_fr
// @description Plug in anty bash
// @include     *ogame.gameforge.com/game/*
// @version     2.3
// @grant       none

// ==/UserScript==

// cookie function
function bake_cookie(name, value) {
  var cookie = [name, '=', JSON.stringify(value), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
  document.cookie = cookie;
}

function read_cookie(name) {
 var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
 result && (result = JSON.parse(result[1]));
 return result;
}

// loading the "page" page from the message page
function getMessage(page) {
	return $.ajax({
		type: 'POST',       
		url: '/game/index.php?page=messages&tab=21&ajax=1',
		data: 'messageId=-1&tabid=21&action=107&pagination='+page+'&ajax=1',
		dataType: 'html',
		context: document.body,
		global: false,
		async:false,
		success: function(data) {
			return data;
		}
	}).responseText;
}

function coordToUrl(coord)
{
	 var coordClean = coord.substring(1, coord.length-1); 
	 var coordTab = coordClean.split(":");
	 return '/game/index.php?page=galaxy&galaxy='+coordTab[0]+'&system='+coordTab[1]+'&position='+coordTab[2] ;
}	

function formateTitle(date,cpt)
{
	var jourFull  = date.split(" ")[0]; 
    var heureFull = date.split(" ")[1].split(":");


    var heure   = heureFull[0];
    var minute  = heureFull[1]; 
	
	return heure+'h'+minute+' le '+ jourFull + ' (p '+cpt+')';
}

function isAppendedToday(date)
{
    var jourFull  = date.split(" ")[0].split("."); 
    var heureFull = date.split(" ")[1].split(":");
    
    var jour = jourFull[0];
    var mois = jourFull[1];
    var annee= jourFull[2];

    var heure   = heureFull[0];
    var minute  = heureFull[1];  

    var hier = new Date();
    hier.setDate(hier.getDate() -1 ); // on veut hier
    
    
    var raid = new Date();
    raid.setFullYear( annee );
    raid.setMonth ( mois - 1 ); // le Js est entre 0 et 11 et pas 1 et 12 
    raid.setDate(jour);
    raid.setHours(heure); 
    raid.setMinutes(minute);
    
    //alert("date : "+date+"\nhier : "+hier +"\nraid : "+ raid);
    return raid > hier;
}



// button for checking
var btn = document.createElement("a");
btn.innerHTML="Check Raid";
btn.className="menubutton";
btn.href ="javascript:"; 				// i don't like href="#" it can make the page moving
btn.addEventListener('click', function(){ displayInfo() ;}, false);
var li=document.createElement("li");
li.appendChild(btn);
var barre = document.getElementById("menuTableTools");
barre.appendChild(li);

// create and hidden div for result storing and parsing
var div = document.createElement("div");
div.id ="verificationAttaque";
div.style.visibility = "hidden"
document.body.appendChild(div);



function displayInfo()
{

	// display a loading gif
	var info = document.createElement("div");
	info.className="adviceWrapper";
	info.innerHTML='<div style="algin:center;text-align: center;"><img src="https://raw.githubusercontent.com/GrosLapin/scriptOgame/master/ajax-loader.gif" /></div>';
	info.id="id_check_attaque";

	var link = document.getElementById("links");
	var conteneur =  document.getElementById('id_check_attaque');
	if (typeof(conteneur) == 'undefined' || conteneur == null)
	{
		link.appendChild(info);
	}
	else
	{
		link.replaceChild(info,conteneur);
	}
	
	
	// seting some constant like the number of page in the message section
    var maxRaid=6;
    var div =  document.getElementById("verificationAttaque");
    div.innerHTML = getMessage(1);
    var litab = document.getElementsByClassName('paginator');
    var li = litab[litab.length -1];
    var maxPage = li.getAttribute("data-page");

    var cpt = 1;
    var ok = true;
    var tabCoord = {};
    var tabCoordHeures = {};
	// main loop
    while (cpt <= maxPage && ok )
    {
		// store the HTML in hidden div
        div.innerHTML = getMessage(cpt);
        var lutab = document.getElementsByClassName('ctn_with_trash');
        var lu = lutab[lutab.length -1];
        var collEnfants = lu.childNodes;

		// 1 of 2 child are not of your bisness, and the first is the < << >> > button so start at 3 and +2
        for (var i = 3; i < collEnfants.length; i=i+2) 
        {   
            var li = collEnfants[i];
            var mesgtab = li.getElementsByClassName('msg_date');
            var date = mesgtab[0];
            if (isAppendedToday(date.innerHTML))
            {
                var locTab = li.getElementsByClassName('txt_link'); 
                var coord = locTab[0].innerHTML;
                if (typeof tabCoord[coord] == 'undefined')
                {
                    tabCoord[coord] = 1;
                    tabCoordHeures[coord] = formateTitle(date.innerHTML,cpt)+'\n';
                }
                else
                {
                    tabCoord[coord] += 1;
                    tabCoordHeures[coord] += formateTitle(date.innerHTML,cpt)+'\n';
                }

            }
            else
            {
                // on est arrivé sur quelque-chose qui date d'il y a plus d'un jour
                ok = false;
                break;
            }
            
        }

   
        cpt++;
    }
    // end of collecting data time for some display
    var isGood =true;
    var coordByNbAttaque = {};
    for (var coord in tabCoord )
    {
        // pour l'affichage en div
        if (typeof coordByNbAttaque[tabCoord[coord]] == 'undefined')
        {
            coordByNbAttaque[tabCoord[coord]] = '<a title="'+tabCoordHeures[coord]+'" href="'+coordToUrl(coord)+'" >'+coord +'</a><br/> ';
        }
        else
        {
            coordByNbAttaque[tabCoord[coord]] +='<a title="'+tabCoordHeures[coord]+'" href="'+coordToUrl(coord)+'">'+coord +'</a><br/>  ';
        }

        // pour l'alert
        if ( tabCoord[coord] >= maxRaid )
        {
            isGood =false;
        }

    }


    var htmlCount = '<div ><span class="overlay" style="color: #FFF;text-decoration: none;font: 11px Verdana,Arial,Helvetica,sans-serif;width: 150px;text-align: center;background: transparent -moz-linear-gradient(center top , #171D23 0px, #101419 100%) repeat scroll 0% 0%;border: 1px solid #3F3D13;border-radius: 5px;padding: 5px;display: block;">';
	 
	if ( isGood ) 
	{
			htmlCount += '<span style="font-weight: bold; color: rgb(0, 128, 0); font-size: 16px;">Pas de risque</span><br/>';
			htmlCount += '<span style="font-weight: bold; color: rgb(0, 128, 0); font-size: 11px;">de bash</span><br/>';
			htmlCount += '<br/><br/>';
	}
	else
	{
			htmlCount += '<span style="font-weight: bold; color: rgb(128, 0, 0); font-size: 16px;">Risque de bash</span>';
			htmlCount += '<br/><br/>';
	}
    for (var count in coordByNbAttaque )
    {
        if ( count == "1")
        {
            htmlCount += count +' attaque :  <br />' + coordByNbAttaque[count] + ' <br/>';
        }
        else if (count < maxRaid )
        {
            htmlCount += count +' attaques :  <br />' + coordByNbAttaque[count] + ' <br/>'; 
        }
		else
		{
		
			htmlCount += '<span style="font-weight: bold; color: rgb(128, 0, 0); font-size: 11px;">';
			htmlCount += count +' attaques :  <br />' + coordByNbAttaque[count] + ' <br/>'; 
			htmlCount +='</span>';
		}
    }

    htmlCount += '</span></div>';
	var info = document.createElement("div");
	info.className="adviceWrapper";
	info.id="id_check_attaque";
	info.innerHTML=htmlCount;

	var link = document.getElementById("links");

	var conteneur =  document.getElementById('id_check_attaque');
	if (typeof(conteneur) == 'undefined' || conteneur == null)
	{
		link.appendChild(info);
	}
	else
	{
		link.replaceChild(info,conteneur);
	}

}


