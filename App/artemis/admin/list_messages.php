<table>
<thead>
<th>Date</th>
<th>Subject</th>
<th>To</th>
<th>From</th>
<th>Sent</th>
<th>Edit/view</th>
</thead>
<?php
require_once("../db.php");
$sql = "SELECT messages.*,users.name AS mfrom FROM messages,users WHERE users.id=messages.from ORDER BY sent_date DESC";
$res = mysql_query($sql);
while($row=mysql_fetch_assoc($res)) {
?>
<tr>
	<td><?=$row["sent_date"];?>
	<td><?=$row["subject"];?></td>
	<td><?php
		$sql = "SELECT messages_recipients.*,users.name FROM messages_recipients,users WHERE message_id=".$row["id"]." AND users.id=messages_recipients.recipient_id ORDER BY users.name ASC";
		$res2 = mysql_query($sql);
		while($row2 = mysql_fetch_assoc($res2)) {
			echo $row2["name"].", ";
		}
	?></td>
	<td><?=$row["mfrom"];?></td>
	<td><?=($row["sent"]==1) ? "Sent": "Not sent";?></td>
	<td><a href="edit_message.php?id=<?=$row["id"];?>">Edit/view</a></td>
</tr>
<?php
}
?>
</table>