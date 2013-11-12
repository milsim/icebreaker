<?php
	session_start();
/*	if ( $_SESSION['uid'] && $_SESSION['uid'] != '13' ) {
		die('System down for upgrade.');
	}
*/
$pages = array(
	'opration',
	'messages',
	'intel',
	'map',
	'roster',
	'files',
	'logout'
);
$page = array_key_exists('page', $_REQUEST) && $_REQUEST['page'] && in_array($_REQUEST['page'], $pages) ? $_REQUEST['page'] : 'operation';

if ($page ==='logout') {
	require_once "logout.php";
}
else {
	require_once "assets/templates/$page.php";
}
