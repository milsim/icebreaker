<?php
session_start();
require("../../db.php");
if ($_SESSION["uid"]) {
    $sql = "SELECT name FROM users WHERE id=".(int)$_SESSION["uid"];
    $res = mysql_query($sql);
    $user = @mysql_result($res,0,"name");
    $user_id = $_SESSION["uid"];
}

print_r($_FILES);
switch($_FILES["file"]["type"]) {
    case "image/jpeg":
	$ext = ".jpg";
    break;
    case "image/png":
	$ext = ".png";
    break;
    case "image/gif":
	$ext = ".gif";
    break;
    case "application/zip":
	$ext = ".zip";
    break;
    case "application/x-zip-compressed":
	$ext = ".zip";
    break;
    default:
	$ext = ".FILE";
    break;
}

$dir = "/usr/share/apache2/milsim.se/www/icebreaker/artemis/assets/uploads/";
$filen = str_replace(" ","_",$user)."_".date("Y-m-d_H_i_s").$ext;
$file = $dir . $filen;
if (move_uploaded_file($_FILES["file"]["tmp_name"],$file)) {
    // generate mail
    $msg = "User $user uploaded  <a href='http://milsim.se/icebreaker/artemis/assets/uploads/".$filen."'>".$filen."</a> at ".date("Y-m-d H:i:s")." </a>";
    $sql ="INSERT INTO messages SET `from`=".$user_id.", subject=\"".$user ." - ". $filen."\", body=\"".e($msg)."\", sent_date=NOW(), sent=1";
    $res = mysql_query($sql);
    $mid = mysql_insert_id();
    $sql = "INSERT INTO messages_recipients SET message_id=".$mid.",recipient_id=13";
    $res =  mysql_query($sql);

}
// <>
?>
