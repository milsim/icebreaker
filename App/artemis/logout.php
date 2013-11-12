<?php
session_start();
if ($_COOKIE['uid']) {
    setcookie('uid', (int) $_POST['uid'], time()+3600*48);
}
$_SESSION['uid'] = null;
unset($_SESSION);
session_destroy();
header('Location: index.php');
