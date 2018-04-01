<?php
	
	require 'config.php';

	$_pass = sha1($_POST['login_password']);

	$query = mysql_query("SELECT user FROM user WHERE user='{$_POST['login_user']}' AND password = '{$_pass}'") or die('SQL 错误！');

	if(mysql_fetch_array($query,MYSQLI_ASSOC)) {
		echo 'true';
	}else {
		echo 'false';
	}
	mysql_close();

?>