<?php
session_start();
header("Content-type: application/json;");
error_reporting(0);

if ($_COOKIE["uid"]) {
	$_SESSION["uid"]=$_COOKIE["uid"];
}


if ($_SESSION["uid"]) {
	require_once 'db.php';

	// check messages
	$sql ="SELECT messages_recipients.*,messages.sent FROM messages_recipients,messages WHERE messages.id=messages_recipients.message_id AND recipient_id=".(int)$_SESSION["uid"]." AND sent=1 AND read_date IS NULL AND messages.sent_date < NOW() ";
	$res = mysql_query($sql);
	if (@mysql_num_rows($res)>0) {
		$msgs =1;
	}
	// check intel
	$sql ="SELECT intel_recipients.*,intel.sent FROM intel_recipients,intel WHERE intel.id=intel_recipients.intel_id AND recipient_id=".(int)$_SESSION["uid"]." AND sent=1 AND read_date IS NULL AND intel.sent_date < NOW() ";
	$res = mysql_query($sql);
	if (@mysql_num_rows($res)>0) {
		$intel =1;
	}

	// check briefing
	$sql = "SELECT * FROM briefing_users WHERE user_id=".(int)$_SESSION["uid"]." AND read_date IS NULL";
	$res = mysql_query($sql);
	if (@mysql_num_rows($res)>0) {
		$briefing = 1;
	}

	$out = array(
		"messages" => (int)$msgs,
		"intel" => (int)$intel,
		"briefing" => (int)$briefing
	);
	echo json_encode($out);

} else {
	die();
}
?>
