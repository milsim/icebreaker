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
<p>
	Top Secret VDV information.
</p>
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
