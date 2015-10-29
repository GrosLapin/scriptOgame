// ==UserScript==
// @name        CheckAttaque
// @namespace   groslapin_s_136_fr
// @description Plug in anty bash
// @include     *ogame.gameforge.com/game/*
// @version     1.9
// @grant       none

// ==/UserScript==


var btn = document.createElement("a");
btn.innerHTML="Check Raid";
btn.className="menubutton";
btn.href ="javascript:"; // vieux hack je veux pas mettre "#" car ça fait bouger sur la page
btn.addEventListener('click', function(){ showAlert() ;}, false);

var li=document.createElement("li");
li.appendChild(btn);

var barre = document.getElementById("menuTableTools");
barre.appendChild(li);

function getMessage(page) {
return $.ajax({
    type: 'POST',       
    url: 'http://s136-fr.ogame.gameforge.com/game/index.php?page=messages&tab=21&ajax=1',
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

var div = document.createElement("div");
div.id ="verificationAttaque";
div.style.visibility = "hidden"
document.body.appendChild(div);

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
function showAlert()
{
    
    var div =  document.getElementById("verificationAttaque");
    div.innerHTML = getMessage(1);

    var litab = document.getElementsByClassName('paginator');
    var li = litab[litab.length -1];
    var maxPage = li.getAttribute("data-page");

    var cpt = 1;
    var ok = true;
    var tabCoord = {};
    var tabCoordHeures = {};
    while (cpt <= maxPage && ok )
    {
        div.innerHTML = getMessage(cpt);
        var lutab = document.getElementsByClassName('ctn_with_trash');
        var lu = lutab[lutab.length -1];
    
    
      
     
        var collEnfants = lu.childNodes;

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
                    tabCoordHeures[coord] = date.innerHTML +'\n';
                }
                else
                {
                    tabCoord[coord] += 1;
                    tabCoordHeures[coord] += date.innerHTML  +'\n';
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
    
    var good = "Vous n'avez attaqué personne 6 fois ou plus dans les 24h.\nBon raid !";
    var notGood = "Vous avez attaqué au moins 6 fois les coordonnées suivantes : ";
    var isGood =true;
    var coordByNbAttaque = {};
    for (var coord in tabCoord )
    {
        // pour l'affichage en div
        if (typeof coordByNbAttaque[tabCoord[coord]] == 'undefined')
        {
            coordByNbAttaque[tabCoord[coord]] = '<span title="'+tabCoordHeures[coord]+'">'+coord +'</span> ';
        }
        else
        {
            coordByNbAttaque[tabCoord[coord]] +='<span title="'+tabCoordHeures[coord]+'">'+coord +'</span> ';
        }

        // pour l'alert
        if ( tabCoord[coord] >= 6 )
        {
            isGood =false;
            notGood += coord +" ";
        }

    }
    if ( isGood ) { alert(good); }
    else { alert(notGood) }
    // Je triche c'est mal, a maj 
    var htmlCount = '<div id="promotionCountdownBox"><a class="overlay">';

    for (var count in coordByNbAttaque )
    {
        htmlCount += count +' attaques :  <br />' + coordByNbAttaque[count] + ' <br/>';
    }

    htmlCount += '</a></div>';
var info = document.createElement("div");
info.className="adviceWrapper";
info.innerHTML=htmlCount;
alert(htmlCount);
var link = document.getElementById("links");
link.appendChild(info);




    

}


