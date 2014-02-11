<?php
if (@$_REQUEST['uid']) {
	require_once 'db.php';
	$sql = "SELECT * FROM users WHERE auth=\"".e($_REQUEST['uid'])."\"";
	$result = mysql_query($sql);
	if (@mysql_num_rows($result)>0) {
		session_start();
		$_SESSION['uid'] = @mysql_result($result, 0, 'id');
		$_SESSION['name'] = @mysql_result($result, 0, 'name');
		$_SESSION['admin'] = (int)mysql_result($result,0,'admin');
		setcookie('uid',@mysql_result($result, 0, 'id'), time()+3600*48);

		if (strtoupper($_POST['uid'])=="DEMO") {
		// specific code for the demo account
			$sql = "DELETE FROM messages WHERE subject LIKE \"%DEMO%\"";
			$res = mysql_query($sql);
			$sql = "DELETE FROM intel WHERE body LIKE \"%demo%\"";
			$res = mysql_query($sql);
			$sql = "DELETE FROM intel_recipients WHERE recipient_id=14 AND intel_id != 1";
			$res = mysql_query($sql);

			$sql = "DELETE FROM messages_recipients WHERE recipient_id=14 AND message_id != 1";
			$res = mysql_query($sql);

			$sql = "UPDATE messages_recipients SET read_date=NULL WHERE recipient_id=14";
			$res = mysql_query($sql);
			$sql = "UPDATE intel_recipients SET read_date=NULL WHERE recipient_id=14";
			$res = mysql_query($sql);
			$sql = "UPDATE briefing_users SET read_date=NULL WHERE user_id=14";
			$res = mysql_query($sql);
		}
		header("Location: index.php");
	} else {
		$err = "<span class=\"error\"><img class=\"warning\" src=\"assets/img/warning.png\"> ERRONEOUS AUTHENTICATION</span>";
	}
}
?>
<?php
require_once 'assets/templates/header.php';
?>
	<div class="box login">
		<img src="assets/img/nato.png"> <h1>ARTEMIS</h1>
		<?=(@$err) ? $err:"Authorize";?>
		<form method="post" action="login.php">
			<input type="text" id='uid' name='uid' autofocus>
		</form>
	</div>
<?php
require_once 'assets/templates/footer.php';
?>
