<?php
require("../db.php");

if ($_POST) {

	$sql = "INSERT INTO messages SET `from`=".$_POST["from"].", subject=\"".e($_POST["subject"])."\", type=\"".e($_POST["type"])."\", body=\"".e($_POST["body"])."\", sent_date=\"".e($_POST["send_date"])."\", sent=".(int)$_POST["sent"];
	$res = mysql_query($sql);
	$id = mysql_insert_id();
	foreach($_POST["send_to"] as $to) {
		$sql = "INSERT INTO messages_recipients SET message_id=".$id.", recipient_id=".$to;
		$res = mysql_query($sql);
	}
	$_POST="";
	header("Location: create_message.php?msg=OK");
}
?>
<?php
if ($_GET["msg"]=="OK") {
?>
<b>Message sent!</b><br><br>
<?php
}
?>
<form method="post" action="create_message.php">
From <select name="from">
<?php
$sql = "SELECT * FROM users ORDER BY name ASC";
$res = mysql_query($sql);
while($row=mysql_fetch_assoc($res)) {
?>
	<option value="<?=$row["id"];?>" <?php if ($row["name"]=="JITFCOM") { echo "selected"; } ?>><?=$row["name"];?></option>
<?php
}
?>
</select><br>

Subject <input type="text" name="subject"><br>

Type <select name="type">
	<option value="">---</option>
	<option value="ORDER">ORDER</option>
	<option value="MESSAGE">MESSAGE</option>
</select><br>

Body<br>
<textarea name="body" style="width:640px;height:200px;"></textarea><br>

Send <select name="sent">
	<option value="0">Do not send</option>
	<option value="1">Send</option>
</select>

Send date <input type="text" name="send_date" value="<?=date("Y-m-d H:i:s");?>"><br>

Send to<br>
<?php
$sql = "SELECT * FROM users ORDER BY name ASC";
$res = mysql_query($sql);
while($row=mysql_fetch_assoc($res)) {
?>
<input type="checkbox" name="send_to[]" value="<?=$row["id"];?>"> <?=$row["name"];?><br>
<?php
}
?><br>
<input type="submit" value=" Save message ">
</form>
