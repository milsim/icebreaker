<?php
/*
jMrHDc - USSF
FYNeAX - UKSF
GkyQ2k - VDV
NaSNzv - ARM
8mmQJG - Jihadists
*/

if (isset($_POST["pin"])){
	switch($_POST["pin"]){
		case "jMrHDc":
?>

<hr/>
<p>
	Top Secret USSF information.
</p>
<hr/>

<?php
		break;

		case "FYNeAX":
?>

<hr/>
<p>
	Top Secret UKSF information.
</p>
<hr/>

<?php
		break;

		case "GkyQ2k":
?>

<hr/>
	<h3>[TRANSMISSION VDV]</h3>

	<pre>
Desantniki!

	Ni är nu del av Operation Kinzhal, med operationsområde Patara i nordöstra Georgien. Sedan interventionen i Georgien för fem år sedan har Georgierna slickat sina sår och stärkt sitt NATO-samarbete, vilket oroar både oss och våra allierade i Abkhazien och Syd-Ossetien.

	Våra underrättelser visar också att banditgrupper från Dagestan och Tjetjenien nu, efter att ha blivit hårt ansatta av våra MVD-förband i Kaukasus, flyttat delar av verksamheten till Georgien, förmodligen för att kunna slå rakt norröver mot ryska ställningar.

	Kampen mot dessa banditer är en av Kremls högsta prioriteter, och det är ni, 45 Gardesregementet av Fallskärmstrupperna, som bär en av huvuduppgifterna i denna operation. Operationen är mycket känslig, då vår närvaro på Georgisk mark kan ge mycket svåra diplomatiska konsekvenser. Iaktag därför största möjliga diskretion! Varken Georgisk eller NATO-trupp kan få vetskap om vår närvaro.


Ert uppdrag
	# Spana och upptäck de banditförband som rör sig och verkar i området. Dokumentation är av högsta vikt, inför eventuella diplomatiska konsekvenser med Georgien.

	# Sök upp och omintetgör eventuella vapenlager, bränsledepåer och andra anläggningar som används av banditerna. Säkra bevis på materielet som används, då underrättelsetjänsten misstänker viss amerikansk skuggverksamhet i att förse banditerna med materiel.

	# Infånga, om möjligt, eller likvidera ledande personer inom banditernas organisation. Underrättelseunderlag följer.

	# Våra underrättelser tyder på utländska hemliga förband som opererar i området, troligtvis i samverkan med banditerna i syfte att skada ryska intressen. Undersök och insamla så mycket bevis på främmande makts assistans till dessa banditer som möjligt, men undvik i görligaste mån stridskontakt med dem - om ni inte till 100% kan säkerställa en total eliminering av sådana förband.


Vidare information ges löpande av SOKOL.


Utgångsläge: Luftlandsättning med fallskärm, [tidpunkt + kartposition]. Uppsamlingsplats [kartposition].

Kodnamn: Er styrka i området går under kodnamnet CHAIKA. Första pluton går under namnet OREL, andra pluton under namnet TSAPLYA. Era två operatörer uppåt i kedjan är STARIK (underrättelse) och SOKOL (operativt befäl). Er primära kontakt är SOKOL.

Rapportering: Avrapportering var tredje timme (00, 03, 06, 09, 12, 15, 18, 21) om inget annat anges. Avrapportera position, kodnamn, status. Till SOKOL. Underrättelseunderlag och begäran till STARIK.

Exfil: 10:00-12:00 [datum], [kartposition]. Helikopter. Förväntad anlöpstid 12 minuter vid anrop. Signalen är GROM, GROM, till SOKOL.

Resurser: Inget luftunderstöd, artilleri eller förstärkingar kan ges under operationens samtliga faser.

	</pre>
<hr/>

<?php
		break;

		case "NaSNzv":
?>

<hr/>
<p>
	Top Secret ARM information.
</p>
<hr/>

<?php
		break;

		case "8mmQJG":
?>

<hr/>
<p>
	Top Secret Jihadist information.
</p>
<hr/>

<?php
		break;

		default:
			header("HTTP/1.0 403 Forbidden");
			die();
		break;
	}
} else {
	header("HTTP/1.0 403 Forbidden");
	die();
}
?>
