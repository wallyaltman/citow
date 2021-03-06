<?php
/* This program sends the .png map
 * and prompts the user to save.
 * Created on: 7 Dec 2010
 */

$slash = strpos(getcwd(), '/') === false ? '\\' : '/';
$docroot = realpath(getcwd() . $slash . '..');

$dir = realpath($docroot.'/chaos/capture/').'/';

$game = $_REQUEST['game'];
$state = $_REQUEST['state'];
$savefile = 'game' . $game . 'state' . $state . '.png';
$readfile = 'tmp.png';

if (file_exists($dir.$file)){
    header('Content-Description: File Transfer');
    header('Content-Disposition: attachment; filename="' . $savefile . '"');
    header('Content-Type: application/octet-stream');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Content-Length: ' . filesize($dir.$readfile));

    ob_clean();
    flush();

    readfile($dir.$readfile);
}
?>