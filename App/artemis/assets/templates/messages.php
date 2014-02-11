<?php require_once 'assets/templates/header.php'; ?>
<div id="main" role="main">
<h1>COMMS</h1>
<?php
if ($_POST) {

        $sql = "INSERT INTO messages SET `from`=".$_SESSION["uid"].", subject=\"".e($_POST["subject"])."\", type=\"".e($_POST["type"])."\", body=\"".e($_POST["body"])."\", sent_date=NOW(), sent=1";
        $res = mysql_query($sql);
        $id = mysql_insert_id();
	foreach($_POST["to"] as $to) {
                $sql = "INSERT INTO messages_recipients SET message_id=".$id.", recipient_id=".$to;
                $res = mysql_query($sql);
        }
        $_POST="";
        echo "Message sent.<br /><br />";
}
?>
<?php if (isset($_GET["action"]) && $_GET["action"] != "send") { ?>[<a href="?page=messages&action=send">SEND MESSAGE</a>]<?php } ?>
<hr>
<?php
if (isset($_GET["action"]) && $_GET["action"]=="send") {
?>
<form method="post" action="?page=messages">
<table>
<tr>
	<td>To</td>
	<td>
		<select name="to[]" multiple>
		<?php
		$sql = "SELECT admin FROM users WHERE id=" . (int)$_SESSION['uid'];
		$res = mysql_query($sql);
		$admin = mysql_result($res, 0, 'admin');

		if ($admin) {
			$sql = "SELECT * FROM users WHERE id NOT IN(".(int)$_SESSION["uid"].")";
		} else {
			$sql = "SELECT * FROM users WHERE visible=1 AND id NOT IN(".(int)$_SESSION["uid"].")";
		}
		$res = mysql_query($sql);
		while($row=mysql_fetch_assoc($res)) {
		?>
			<option value="<?=$row["id"];?>"><?=$row["name"];?></option>
		<?php
		}
		?>
		</select>
	</td>
</tr>
<tr>
	<td>Subject</td>
	<td>
		<input type="text" name="subject" style="width:225px;">
	</td>
</tr>
<tr>
	<td>
	Message
	</td>
	<td>
		<textarea name="body" style="width:300px;height:200px;"></textarea>
	</td>
</tr>
<tr>
	<td colspan="2">
		<input type="submit" value=" SEND ">
	</td>
</tr>
</table>
</form>
<?php
	die();
}


if (@$_GET["id"]) {
$sql = "SELECT messages.*,users.id AS user_id, users.name AS user_name FROM messages,messages_recipients,users WHERE users.id=messages.from AND messages.sent=1 AND messages.id=".(int)$_GET["id"];
$res = mysql_query($sql);
?>
From: <b><?=mysql_result($res,0,"user_name");?></b><br>
Sent: <b><?=mysql_result($res,0,"sent_date");?></b><br>
<br>
<?php
echo nl2br(@mysql_result($res,0,"body"));

/* mark as read */
	if (@mysql_result($res,0,"id")) {
		$sql = "SELECT * FROM messages_recipients WHERE recipient_id=".(int)$_SESSION["uid"]." AND message_id=".@mysql_result($res,0,"id");
		$res = mysql_query($sql);
		if (@mysql_result($res,0,"read_date") == NULL) {
			$sql = "UPDATE messages_recipients SET read_date=NOW() WHERE message_id=".(int)$_GET["id"]." AND recipient_id=".(int)$_SESSION["uid"];
			$res = mysql_query($sql);
		}
	}
die();
}
?>
<table style="width:100%">
	<tr>
	<td>Recieved messages</td>
	<td>Sent messages</td>

	</tr>
	<tr>
		<td style="width:50%; vertical-align: top;">

<table>
<thead>
	<th>Sent</th>
	<th>Subject</th>
	<th>From</th>
</thead>
<tbody>
<?php
$sql = "SELECT messages.*,users.name AS user_name,messages_recipients.read_date FROM messages, messages_recipients,users WHERE users.id=messages.from AND messages_recipients.recipient_id=".$_SESSION["uid"]." AND messages_recipients.message_id=messages.id AND messages.sent=1 AND messages.sent_date < NOW() ORDER BY sent_date DESC";
$res = mysql_query($sql);
$x=0;
while($row = mysql_fetch_assoc($res)) {
?>
<tr class="selectable <?=($x % 2) ? "odd":"" ;?> message_row <?=(@$row["read_date"] != NULL) ? '' : 'unread' ;?>">
	<td><a href="?page=messages&id=<?=$row["id"];?>"><?=$row["sent_date"];?></a></td>
	<td><a href="?page=messages&id=<?=$row["id"];?>"><?=$row["subject"];?></a></td>
	<td><a href="?page=messages&id=<?=$row["id"];?>"><?=$row["user_name"];?></a></td>
</tr>
<?php
$x++;
}
?>
</tbody>
</table>
		</td>
		<td style="width:50%; vertical-align: top;">

			<table>
			<thead>
			<th>Sent</th>
        		<th>Subject</th>
        		<th>To</th>
			</thead>
			<tbody>
<?php
$sql = "SELECT messages.*,users.name AS user_name,messages_recipients.read_date FROM messages, messages_recipients,users WHERE users.id=messages_recipients.recipient_id AND messages.from=".$_SESSION["uid"]." AND messages_recipients.message_id=messages.id AND messages.sent=1 ORDER BY sent_date DESC";
$res = mysql_query($sql);
$x=0;
while($row = mysql_fetch_assoc($res)) {
?>
<tr class="selectable <?=($x % 2) ? "odd":"" ;?> message_row <?=(@$row["read_date"] != NULL) ? '' : 'unread' ;?>">
        <td><a href="?page=messages&id=<?=$row["id"];?>"><?=$row["sent_date"];?></a></td>
        <td><a href="?page=messages&id=<?=$row["id"];?>"><?=$row["subject"];?></a></td>
        <td><a href="?page=messages&id=<?=$row["id"];?>"><?=$row["user_name"];?> <?= $row["read_date"] ? '[read]' : '' ?></a></td>
</tr>
<?php
$x++;
}
?>
			</tbody>

		</td>
	</tr>
</table>

</div>
<?php require_once 'assets/templates/footer.php'; ?>
