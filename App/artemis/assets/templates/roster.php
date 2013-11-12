<h1>AVAILABLE ASSETS</h1>
<hr>
<?php
$sql = "SELECT * FROM users WHERE visible=1";
$res = mysql_query($sql);
?>
<table>
<thead>
<th>CALLSIGN</th>
<th>OPERATORS</th>
</thead>
<?php
$x=0;
while($row=mysql_fetch_assoc($res)) {
?>
<tr <?=($x % 2) ? "class='odd'":"";?>>
	<td><?=$row["name"];?></td>
	<td><?= $row["id"] == 13 ? 'N/A' : $row["max_operators"];?></td>
</tr>
<?php
$x++;
}
?>
</table>
<h1>Upline</h1>
JITFCOM - JITF Command<br>
JITFHUMINT - JITF Human Intelligence<br>
JITFGEOINT - JITF Geographical Intelligence<br>
JITFSIGINT - JITF Signals Intelligence<br>
JITFCYBINT - JITF Cyber Intelligence<br>
