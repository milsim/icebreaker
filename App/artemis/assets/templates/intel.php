<h1>INTEL</h1>
<hr>
<?php
if (@$_GET["id"]) {
$sql = "SELECT * FROM intel WHERE sent=1 AND id=".(int)$_GET["id"];
$res = mysql_query($sql);
echo nl2br(@mysql_result($res,0,"body"));

/* mark as read */
	if (@mysql_result($res,0,"id")) {
		$sql = "SELECT * FROM intel_recipients WHERE recipient_id=".(int)$_SESSION["uid"]." AND intel_id=".@mysql_result($res,0,"id");
		$res = mysql_query($sql);
		if (@mysql_result($res,0,"read_date") == NULL) {
			$sql = "UPDATE intel_recipients SET read_date=NOW() WHERE intel_id=".(int)$_GET["id"]." AND recipient_id=".(int)$_SESSION["uid"];
			$res = mysql_query($sql);
		}
	}
die();
}
?>
<table>
<thead>
	<th>Sent</th>
	<th>Subject</th>
	<th>Type</th>
</thead>
<tbody>
<?php
$sql = "SELECT intel.*,intel_recipients.read_date FROM intel, intel_recipients WHERE intel.id=intel_recipients.intel_id AND intel_recipients.recipient_id=".$_SESSION["uid"]." AND intel.sent=1 AND intel.sent_date < NOW() ORDER BY sent_date DESC";
$res = mysql_query($sql);
$x=0;
while($row = mysql_fetch_assoc($res)) {
?>
<tr class="selectable <?=($x % 2) ? "odd":"" ;?> message_row <?=(@$row["read_date"] != NULL) ? '' : 'unread' ;?>">
	<td><a href="?page=intel&id=<?=$row["id"];?>"><?=$row["sent_date"];?></a></td>
	<td><a href="?page=intel&id=<?=$row["id"];?>"><?=$row["title"];?></a></td>
	<td><a href="?page=intel&id=<?=$row["id"];?>"><?=$row["type"];?></a></td>
</tr>
<?php
$x++;
}
?>
</tbody>
</table>
