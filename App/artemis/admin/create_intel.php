<?php
require("../db.php");

if ($_POST) {
	$sql = "INSERT INTO intel SET title=\"".e($_POST["subject"])."\", type=\"".e($_POST["type"])."\", body=\"".e($_POST["body"])."\", sent=\"".(int)$_POST["sent"]."\", sent_date=\"".e($_POST["send_date"])."\"";
	$res = mysql_query($sql);
	$intel_id = mysql_insert_id();
	foreach($_POST["send_to"] as $to) {
		$sql = "INSERT INTO intel_recipients SET intel_id=".(int)$intel_id.", recipient_id=".(int)$to;
		$res = mysql_query($sql);
	}
	header("Location: create_intel.php?msg=OK");
}

if($_REQUEST["msg"]=="OK") {
	echo "<b>INTEL created!</b><br>";
	$_POST=null;
}

?>
<form method="post" action="create_intel.php">
Subject <input type="text" name="subject"><br>

Type <select name="type">
	<option value="">---</option>
	<option value="HUMINT">HUMINT</option>
	<option value="SIGINT">SIGINT</option>
	<option value="CYBINT">CYBINT</option>
	<option value="GEOSAT">GEOSAT</option>
	<option value="HQ">HQ</option>
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
