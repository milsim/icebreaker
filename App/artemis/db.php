<?php
require_once 'db_config.php';

mysql_connect(DB_HOST, DB_USER, DB_PASSWORD);
mysql_select_db(DB_NAME);

mysql_query('SET NAMES ' . DB_CHARSET);

function e($sql) {
	return mysql_real_escape_string($sql);
}
