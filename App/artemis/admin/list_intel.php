<table>
<thead>
<th>Date</th>
<th>Title</th>
<th>To</th>
<th>Type</th>
<th>Sent</th>
<th>Edit/view</th>
</thead>
<?php
require_once("../db.php");
$sql = "SELECT intel.* FROM intel ORDER BY sent_date DESC";
$res = mysql_query($sql);
$x=0;
while($row=mysql_fetch_assoc($res)) {
?>
<tr style="background-color:#<?php if($x %2 == 0) { echo "fff"; } else { echo "ddd"; } ?>;">
	<td><?php 
	if(date("Y-m-d H:i:s") > $row["sent_date"]) {
		echo "<b style=\"background-color:#99ff99;\">".$row["sent_date"]."</b>";
	} else {
		echo "<b style=\"background-color:#ff9999;\">".$row["sent_date"]."</b>";
	}
	?></td>
	<td><?=$row["title"];?></td>
	<td><?php
		$sql = "SELECT intel_recipients.*,users.name FROM intel_recipients,users WHERE intel_id=".$row["id"]." AND users.id=intel_recipients.recipient_id ORDER BY users.name ASC";
		$res2 = mysql_query($sql);
		while($row2 = mysql_fetch_assoc($res2)) {
			if($row2["read_date"] != null) {
			echo "<b style=\"background-color:#99ff99;\">".$row2["name"]."</b>, ";
			} else {
			echo $row2["name"].", ";
			}
		}
	?></td>
	<td><?=$row["type"];?></td>
	<td><?=($row["sent"]==1) ? "<b style=\"background-color:#99ff99;\">Sent</b>": "Not sent";?></td>
	<td><a href="edit_intel.php?id=<?=$row["id"];?>">Edit/view</a></td>
</tr>
<?php
$x++;
}
?>
</table>