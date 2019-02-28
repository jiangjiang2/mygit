<?php
require'config.php';
$query="INSERTINTOuser(user,pass,email,sex, birthday,date)
 VALUES('{$_POST['user']}',
     sha1('{$_POST['pass']}'),
    '{$_POST['email']}',
    '{$_POST['sex']}',
    '{$_POST['birthday']}', NOW())";
    mysql_query($query)ordie('新增失败！'.mysql_error());
    echomysql_affected_rows();
    mysql_close();

?>