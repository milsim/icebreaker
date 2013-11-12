<?php require_once 'assets/templates/header.php'; ?>
<div id="main" role="main">
<h1>BRIEFING</h1>
<?php
$sql = "SELECT briefing.* FROM briefing, briefing_users WHERE briefing_users.user_id = ".$_SESSION["uid"]." AND briefing.id=briefing_users.briefing_id";
$res = mysql_query($sql);
if (mysql_num_rows($res)>0) {
?>
<?=nl2br(mysql_result($res,0,"body"));?>
<?php
// mark as read
$sql = "UPDATE briefing_users SET read_date=NOW() WHERE briefing_id=".@mysql_result($res,0,"id")." AND user_id=".(int)$_SESSION["uid"];
$res = mysql_query($sql);

} else {
?>
No operational data available.
<?php
}
?>
</div>
<?php require_once 'assets/templates/footer.php'; ?>
