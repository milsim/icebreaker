<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/x-icon" href="/icebreaker/artemis/favicon.ico">
    <meta http-equiv="refresh" content="60;url=show_gps.php">
    <style>
    tr.admintable td {
        border:1px solid black; padding:5px;
    }
    </style>
</head>
<?php
require_once "db.php";
$sql = "SELECT users.name, gps_current.* FROM gps_current,users,gps_units WHERE gps_current.gps_id=gps_units.gps_id AND users.id=gps_units.unit_id ORDER BY gps_current.gps_id";
$res = mysql_query($sql);
?>
<table>
<?php
while($row=mysql_fetch_assoc($res)) {
?>
<tr class="admintable">
  <td><?=$row["gps_id"];?></td>
  <td><?=$row["name"];?></td>
  <td><?=date("Y-m-d H:i:s",$row["gps_latestupdate"] -3600);?></td>
  <td><?=$row["lat"];?></td>
  <td><?=$row["long"];?></td>
  <td><?=$row["status"];?></td>
</tr>
<?php
}
?>
</table>
