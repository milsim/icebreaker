<?php
require_once("../db.php");

if($_REQUEST["move"]) {
	$move =  0.0002790; // roughly 10 meters
	$long_move = $move + 0.000400; // add some for longitudal movement
	$sql = "SELECT * FROM gps_current WHERE gps_id=".(int)$_REQUEST["id"];
	$res = mysql_query($sql);
	$lat = @mysql_result($res,0,"lat");
	$long = @mysql_result($res,0,"long");
	echo $lat.",".$long."<br>";
	switch($_REQUEST["move"]) {
		case "N":
			$lat = $lat + $move;
		break;
		case "NE":
			$long = $long + $long_move;
			$lat = $lat + $move;
		break;
		case "E":
			$long = $long + $long_move;
		break;
		case "SE":
			$long = $long + $long_move;
			$lat = $lat - $move;
		break;
		case "S":
			$lat = $lat - $move;
		break;
		case "SW":
			$long = $long - $long_move;
			$lat = $lat - $move;
		break;
		case "W":
			$long = $long - $long_move;
		break;
		case "NW":
			$long = $long - $long_move;
			$lat = $lat + $move;
		break;
	}
	$sql = "UPDATE gps_current SET gps_latestupdate = NOW(), `lat` = \"".$lat."\", `long`=\"".$long."\" WHERE gps_id=".(int)$_REQUEST["id"];
	$res = mysql_query($sql);
	echo $lat.",".$long."<br>";
}


$sql = "SELECT users.*, gps_units.gps_id FROM users,gps_units WHERE users.id=gps_units.unit_id ORDER BY users.faction ASC";
$res = mysql_query($sql);
?>

<table>
<?php
while($row=mysql_fetch_assoc($res)) {
?>
<tr>
	<td><b><?=$row["name"];?></b></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=N">N</a></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=NE">NE</a></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=E">E</a></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=SE">SE</a></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=S">S</a></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=SW">SW</a></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=W">W</a></td>
	<td><a href="move_units.php?id=<?=$row["gps_id"];?>&move=NW">NW</a></td>
<?php
}
?>
</table>
