<?php
require("../db.php");
if(!$_REQUEST["id"]) {
	die();
}

if ($_POST) {
	$sql = "UPDATE intel SET title=\"".e($_POST["subject"])."\", type=\"".e($_POST["type"])."\", body=\"".e($_POST["body"])."\", sent=\"".(int)$_POST["sent"]."\", sent_date=\"".e($_POST["send_date"])."\" WHERE id=".(int)$_POST["id"];
	$res = mysql_query($sql);
	$sql = "DELETE FROM intel_recipients WHERE intel_id=".(int)$_POST["id"];
	$res = mysql_query($sql);

	foreach($_POST["send_to"] as $to) {
		$sql = "INSERT INTO intel_recipients SET intel_id=".(int)$_POST["id"].", recipient_id=".(int)$to;
		$res = mysql_query($sql);
	}
	header("Location: list_intel.php?msg=OK");
}

$sql = "SELECT * FROM intel WHERE id=".(int)$_REQUEST["id"];
$res = mysql_query($sql);

?>
<form method="post" action="edit_intel.php">
<input type="hidden" name="id" value="<?=$_REQUEST["id"];?>">
Subject <input type="text" name="subject" value="<?=@mysql_result($res,0,"title");?>"><br>

Type <select name="type">
	<option value="">---</option>
	<option value="HUMINT" <?=(mysql_result($res,0,"type")=="HUMINT") ? 'selected':'';?>>HUMINT</option>
	<option value="SIGINT" <?=(mysql_result($res,0,"type")=="SIGINT") ? 'selected':'';?>>SIGINT</option>
	<option value="CYBINT" <?=(mysql_result($res,0,"type")=="CYBINT") ? 'selected':'';?>>CYBINT</option>
	<option value="GEOSAT" <?=(mysql_result($res,0,"type")=="GEOSAT") ? 'selected':'';?>>GEOSAT</option>
	<option value="HQ" <?=(mysql_result($res,0,"type")=="HQ") ? 'selected':'';?>>HQ</option>
</select><br>

Body<br>
<textarea name="body" style="width:640px;height:200px;"><?=mysql_result($res,0,"body");?></textarea><br>

Send <select name="sent">
	<option value="0" <?=(mysql_result($res,0,"sent")==0) ? 'selected':'';?>>Do not send</option>
	<option value="1" <?=(mysql_result($res,0,"sent")==1) ? 'selected':'';?>>Send</option>
</select>

Send date <input type="text" name="send_date" value="<?=mysql_result($res,0,"sent_date");?>"><br>

Send to<br>
<?php
$sql = "SELECT * FROM intel_recipients WHERE intel_id=".(int)$_REQUEST["id"];
$res2 = mysql_query($sql);
$recipients=array();
while($row2 = mysql_fetch_assoc($res2)) {
	$recipients[] = $row2["recipient_id"];
}

$sql = "SELECT * FROM users ORDER BY name ASC";
$res = mysql_query($sql);
while($row=mysql_fetch_assoc($res)) {
?>
<input <?php if(in_array($row["id"],$recipients)) { echo 'checked'; } ?> type="checkbox" name="send_to[]" value="<?=$row["id"];?>"> <?=$row["name"];?><br>
<?php
}
?><br>
<input type="submit" value=" Save message ">
</form>
