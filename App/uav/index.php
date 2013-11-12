<?php
require("../artemis/db.php");

	if (isset($_REQUEST["s"])){
		//Insert something in a DB so we can alert/track progress
		$sql = "INSERT INTO uav SET action=\"start\", ts=NOW(), ip=\"".e($_SERVER["REMOTE_ADDR"])."\"";
		$res = mysql_query($sql);
		die( "Firmware extraction started: " . date('Y-m-d H:i:s') . "\n" );
	}

	if (isset($_REQUEST["e"])){
		//Insert something in a DB so we know that the download is complete
		$sql = "INSERT INTO uav SET action=\"end\", ts=NOW(), ip=\"".e($_SERVER["REMOTE_ADDR"])."\"";
		$res = mysql_query($sql);
		die( "Firmware extraction ended: " . date('Y-m-d H:i:s') . "\n" );
	}
?>
