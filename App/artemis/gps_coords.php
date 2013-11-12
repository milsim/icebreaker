<?php
header('Content-type: application/json');

require_once 'db.php';

    switch ($_GET['f']) {
        case 'n':
            $w = ' AND users.faction="nato"';
           break;
        case 'j':
            $w = ' AND users.faction="jamaat"';
           break;
        case 'a':
            $w='';
           break;
        default:
            $w = ' AND users.faction="nato"';
           break;
    }

    switch ($_GET['v']) {
        case 'a':
            $v = '';
            break;
        default:
            $v = ' AND users.visible=1';
            break;
    }

    switch($_GET['t']) {
    case 'u':
        $p = ' AND gps_points.type="unknown"';
       break;
    case 'f':
        $p = ' AND gps_points.type="friendly"';
       break;
    case 'h':
        $p = ' AND gps_points.type="hostile"';
       break;
    case 'p':
        $p = ' AND gps_points.type="point_of_interest"';
       break;
    case 'a':
        $p = '';
       break;
    default:
        $p='';
       break;
    }

$sql = "SELECT gps_current.* , users.name, users.id, users.faction
FROM gps_current, gps_units, users
WHERE users.id = gps_units.unit_id
AND gps_current.gps_id = gps_units.gps_id $w $v";

$res = mysql_query($sql);
$out = array();
$x = 0;

$service_callback = ($_REQUEST['callback']) ? $_REQUEST['callback'] : false;

function jsonp( $data = array(), $callback = false ) {
    $json = json_encode($data);
    return ($callback) ? "$callback(" . $json . ');' : $json;
}


while ($row = mysql_fetch_assoc($res)) {
    $out[$x]['gps_id'] = $row['gps_id'];
    $out[$x]['gps_name'] = $row['gps_name'];
    $out[$x]['gps_latestupdate'] = $row['gps_latestupdate'];
    $out[$x]['status'] = $row['status'];
    $out[$x]['lat'] = $row['lat'];
    $out[$x]['long'] = $row['long'];
    $out[$x]['unit_name'] = $row['name'];
    $out[$x]['unit_id'] = $row['id'];
    $out[$x]['faction'] = $row['faction'];
    $out[$x]['unit_type'] = ($row['faction'] == 'jamaat') ? 3 : 1;
    $x++;
}

// fetch our own points
if ($_GET['t']) {
    $sql = "SELECT * FROM gps_points WHERE expire > NOW() $p";
    $res = mysql_query($sql);
    while($row=mysql_fetch_assoc($res)) {
        $out[$x]['gps_id'] = $row['id'];
        $out[$x]['gps_name'] = 'point_' . $row['id'];
        $out[$x]['gps_latestupdate'] = time();
        $out[$x]['status'] = 1;
        $out[$x]['lat'] = $row['lat'];
        $out[$x]['long'] = $row['long'];
        $out[$x]['unit_name'] = $row['name'];
        $out[$x]['unit_id'] = 0;
        $out[$x]['faction'] = $row['type'];
        $out[$x]['unit_type'] = $row['unit_type'];
       $x++;
    }
}
    //might be a nice thing to return the proper header e.g 'header('HTTP/1.0 200 OK');'
    echo jsonp( $out, $service_callback );
?>
