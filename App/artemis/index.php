<?php
	session_start();
/*	if ( $_SESSION['uid'] && $_SESSION['uid'] != '13' ) {
		die('System down for upgrade.');
	}
*/

require_once 'assets/templates/header.php';
require_once 'assets/templates/loggedin.php';
require_once 'assets/templates/menu.php';
?>
<br>
<div class='box'>
<?php
switch ($_GET['page']) {
	case 'operation':
		require_once 'assets/templates/operation.php';
		break;
	case 'messages':
		require_once 'assets/templates/messages.php';
		break;
	case 'intel':
		require_once 'assets/templates/intel.php';
		break;
	case 'map':
		require_once 'assets/templates/map.php';
		break;
	case 'roster':
		require_once 'assets/templates/roster.php';
		break;
	case 'files':
		require_once 'assets/templates/files.php';
		break;
	case 'logout':
		require_once 'logout.php';
		break;
	default:
		require_once 'assets/templates/operation.php';
	break;
}
?>
</div>
<?php require_once 'assets/templates/footer.php';?>
