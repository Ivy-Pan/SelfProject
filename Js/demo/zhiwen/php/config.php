<?php

	header('Content-Type: text/html; charset=utf-8');

	define('DB_HOST', 'localhost');
	define('DB_USER', 'Ivy');
	define('DB_PWD', 'pai1314');
	define('DB_NAME', 'zhiwen');

	$conn = @mysql_connect(DB_HOST,DB_USER,DB_PWD) or die('数据库连接失败：'.mysql_error());

	@mysql_select_db(DB_NAME) or die('数据库错误：'.mysql_error());

	@mysql_query('SET NAMES UTF8') or die('字符集错误：'.mysql_error());

?>