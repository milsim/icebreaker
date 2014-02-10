<?php
/*
 * This script fetches GPS coordinates from the GPS tracker service, 
 * truncates the current coordinate database and set the new coordinates
 * 
 */

set_time_limit(0);
require_once 'db.php';

function jsonp_decode($jsonp, $assoc = false) { // PHP 5.3 adds depth as third parameter to json_decode
    if ($jsonp[0] !== '[' && $jsonp[0] !== '{') { // we have JSONP
       $jsonp = substr($jsonp, strpos($jsonp, '('));
    }
    return json_decode(trim($jsonp,'();'), $assoc);
}

$url = "http://keyhole2.sykewarrior.com/api/v1/positions.json?identifier=icebreaker&callback=monkey";

// fetch data
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,true);
curl_setopt($ch, CURLOPT_URL, $url);
$result = curl_exec($ch);

$return = jsonp_decode($result);

/*
    [id] => 12
    [name] => RK5
    [latest_update] => 0
    [latitude] => 59.371021666666664
    [longitude] => 18.15647
    [status] => 0
*/

// empty current table
    $sql = "TRUNCATE TABLE gps_current";
    $res = mysql_query($sql);
foreach($return->devices as $d) {
    // update current
    $sql = "INSERT INTO gps_current SET gps_id=" . (int)$d->id . ", gps_name=\"" . e($d->name) . "\", log_date=NOW(), gps_latestupdate=\"" . (int)$d->latest_update . "\", lat=\"" . e($d->latitude) . "\", `long`=\"" . e($d->longitude) . "\", status=".(int)$d->status;
    //echo $sql."\n";
    $res = mysql_query($sql);

    // send to log
    $sql = "INSERT INTO gps_log SET gps_id=" . (int)$d->id . ", gps_name=\"" . e($d->name) . "\", log_date=NOW(), gps_latestupdate=\"" . (int)$d->latest_update . "\", lat=\"" . e($d->latitude) . "\", `long`=\"" . e($d->longitude) . "\", status=".(int)$d->status;
	//echo $sql."\n";
    $res2 = mysql_query($sql);
}

?>
