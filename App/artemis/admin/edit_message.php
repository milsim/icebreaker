<?php
require_once("../db.php");
if ($_GET["id"]) {
	$sql = "SELECT messages.*,messages_recipients.* FROM messages,messages_recipients WHERE messages_recipients.message_id=messages.id AND messages.id=".(int)$_GET["id"];
	$result = mysql_query($sql);
}
?>
<form method="post" action="edit_message.php">
From <select name="from">
<?php
$sql = "SELECT * FROM users ORDER BY name ASC";
$res = mysql_query($sql);
while($row=mysql_fetch_assoc($res)) {
?>
	<option value="<?=$row["id"];?>" <?php if ($row["id"] == @mysql_result($result,0,"from")) { echo "selected"; } ?>><?=$row["name"];?></option>
<?php
}
?>
</select><br>

Subject <input type="text" name="subject" value="<?=@mysql_result($result,0,"subject");?>"><br>

Type <select name="type">
	<option value="" <?=(@mysql_result($result,0,"type") == "") ? "selected":"";?>>---</option>
	<option value="ORDER" <?=(@mysql_result($result,0,"type") == "ORDER") ? "selected":"";?>>ORDER</option>
	<option value="MESSAGE" <?=(@mysql_result($result,0,"type") == "MESSAGE") ? "selected":"";?>>MESSAGE</option>
</select><br>

Body<br>
<textarea name="body" style="width:640px;height:200px;"><?=@mysql_result($result,0,"body");?></textarea><br>

Send <select name="sent">
	<option value="0" <?=(@mysql_result($result,0,"sent")==0) ? "selected":"";?>>Not sent</option>
	<option value="1"<?=(@mysql_result($result,0,"sent")==1) ? "selected":"";?>>Sent</option>
</select>

Send date <input type="text" name="send_date" value="<?=@mysql_result($result,0,"sent_date");?>"><br>

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
