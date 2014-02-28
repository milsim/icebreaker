<?php
require_once("../db.php");

if(isset($_REQUEST["move"]) && $_REQUEST["move"]) {
	$move =  0.0002790; // roughly 10 meters
	$long_move = $move + 0.000400; // add some for longitudal movement
	$sql = "SELECT * FROM gps_current WHERE gps_id=".(int)$_REQUEST["id"];
	$res = mysql_query($sql);
	$lat = @mysql_result($res,0,"lat");
	$long = @mysql_result($res,0,"long");
	
	echo "before: ".$lat.", ".$long."<br/>";
	switch($_REQUEST["move"]) {
		case "N":
			$lat = $lat + $move;
		break;
		case "NE":
			$long = $long + $long_move;
			$lat = $lat + $move;
		break;
		case "E":
			$long = $long + $long_move;
		break;
		case "SE":
			$long = $long + $long_move;
			$lat = $lat - $move;
		break;
		case "S":
			$lat = $lat - $move;
		break;
		case "SW":
			$long = $long - $long_move;
			$lat = $lat - $move;
		break;
		case "W":
			$long = $long - $long_move;
		break;
		case "NW":
			$long = $long - $long_move;
			$lat = $lat + $move;
		break;
	}
	$sql = "UPDATE gps_current SET gps_latestupdate = NOW(), `lat` = \"".$lat."\", `long`=\"".$long."\" WHERE gps_id=".(int)$_REQUEST["id"];
	$res = mysql_query($sql);
	echo "after: ".$lat.", ".$long;
	die();
}


$sql = "SELECT users.*, gps_units.gps_id FROM users,gps_units WHERE users.id=gps_units.unit_id ORDER BY users.faction ASC";
$res = mysql_query($sql);
?>
<style>
@import "//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css";

.north-west, .south-west, .south-east, .north-east {
    -webkit-transform: rotate(45deg);
}

.move {
	margin: 1em;
	display: inline;
}

.move ul {
	padding: 0; margin: .5em .7em;
}

.move ul li {
    font-size: 150%;
    width: 1.25em; height: 1.25em;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
}
a {
    color: #000;
}
a:active {
    color: #ddd;
}
.move a.disabled {
	opacity: .5;
}
</style>
<script type='text/javascript' src='http://code.jquery.com/jquery-git2.js'></script>

<script type='text/javascript'>//<![CDATA[ 
$(window).load(function(){
	$(".move a").click(function(e){
		e.preventDefault();
		var a = $(this);
		
		if( a.hasClass("disabled") )
			return;
		
		a.addClass("disabled");
		$.get(
			$(this)
				.attr("href")
				.replace("{id}", $(".unit").val())
		).done(function(re){			
		
		console.log(re)
		
			a.removeClass("disabled");
			$(".recent").html(re);
		});
	});
});//]]>  
</script>

<select class="unit">
<?php
while($row=mysql_fetch_assoc($res)) {
		echo "<option value=\"{$row["gps_id"]}\">{$row["name"]}</option>";
}
?>
</select>
<div class="move">
	<ul>
		<li><a href="move_units.php?id={id}&move=NW"><i class="fa fa-arrow-left north-west"></i></a>
		<li><a href="move_units.php?id={id}&move=N"><i class="fa fa-arrow-up north"></i></a>
		<li><a href="move_units.php?id={id}&move=NE"><i class="fa fa-arrow-up north-east"></i></a>
	</ul>
	<ul>
		<li><a href="move_units.php?id={id}&move=W"><i class="fa fa-arrow-left west"></i></a>
		<li><i class="fa fa-dot-circle-o mid"></i>
		<li><a href="move_units.php?id={id}&move=E"><i class="fa fa-arrow-right east"></i></a>
	</ul>
	<ul>    
		<li><a href="move_units.php?id={id}&move=SW"><i class="fa fa-arrow-down south-west"></i></a>
		<li><a href="move_units.php?id={id}&move=S"><i class="fa fa-arrow-down south"></i></a>
		<li><a href="move_units.php?id={id}&move=SE"><i class="fa fa-arrow-right south-east"></i></a>
	</ul>
</div>	
<a href="../admin"><i class="fa fa-angle-double-left"></i> Back</a>

<p class="recent"></p>