<?php
if (@$_COOKIE["uid"]) {
	$_SESSION["uid"]=$_COOKIE["uid"];
} else {
	header("Location: login.php");
}
?>
