<?php require_once 'assets/templates/header.php'; ?>
<?php
require_once 'db.php';
header("Content-type:text/html;charset=utf-8;");
?><!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/x-icon" href="/icebreaker/artemis/favicon.ico">
    <title>ARTEMIS</title>
    <script type="text/javascript" src="assets/js/jquery.min.js"></script>
    <style type="text/css">@import url(assets/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css);</style>
    <!-- Third party script for BrowserPlus runtime (Google Gears included in Gears runtime now) -->
    <script type="text/javascript" src="http://bp.yahooapis.com/2.4.21/browserplus-min.js"></script>
    <!-- Load plupload and all it's runtimes and finally the jQuery queue widget -->
    <script type="text/javascript" src="assets/plupload/js/plupload.full.min.js"></script>
    <script type="text/javascript" src="assets/plupload/js/jquery.plupload.queue/jquery.plupload.queue.js"></script>
    <script type="text/javascript" src="assets/js/script.js"></script>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/normalize/2.1.3/normalize.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <link href='http://fonts.googleapis.com/css?family=Share+Tech+Mono' rel='stylesheet' type='text/css'>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <link rel="apple-touch-startup-image" href="http://i.imm.io/Lmmf.jpeg" />
    <link rel="apple-touch-icon" href="http://i.imm.io/Lmo7.jpeg" />
</head>
<body>
<?php
require_once 'assets/templates/loggedin.php';
require_once 'assets/templates/menu.php';
?>
<?php require_once 'assets/templates/footer.php'; ?>
