<?php
session_start();
if ($_SESSION['uid'] !== 14) {
	die();
}
require_once 'db.php';
$rand = rand(0, 5);

switch ($rand) {
	case 0:
		// generate an example message
		$sql = "INSERT INTO messages SET `from`=".rand(9,13).", subject=\"[DEMO] example message\", body=\"This is a demo message.\",sent_date=NOW(), sent=1";
		echo $sql;
		$res = mysql_query($sql);
		$id = mysql_insert_id();
		$sql = "INSERT INTO messages_recipients SET message_id=".$id.", recipient_id=14";
		$res = mysql_query($sql);
		break;
	case 1:
		// generate example intel
		$type=array(0=>"HUMINT",1=>"GEOINT",2=>"SIGINT",3=>"CYBINT");
		$sql = "INSERT INTO intel SET type=\"".$type[rand(0,3)]."\", title=\"[DEMO] example intel\", body=\"This is a demo intel file.\",sent_date=NOW(), sent=1";
		$res = mysql_query($sql);
		$id = mysql_insert_id();
		$sql = "INSERT INTO intel_recipients SET intel_id=".$id.", recipient_id=14";
		$res = mysql_query($sql);
		break;
	case 2:
		// generate changes to briefing
		$sql = "UPDATE briefing SET body=\"This is a sample briefing, updated.".sha1(date("YmdHis"))."\" WHERE id=2";
		$res = mysql_query($sql);
		$sql = "UPDATE briefing_users SET read_date=NULL WHERE user_id=14";
		$res = mysql_query($sql);
		break;
	default:
		break;
}
