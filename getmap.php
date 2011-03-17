<?php
/* This program sends the .png map
 * and prompts the user to save.
 * Created on: 7 Dec 2010
 */

//$root = realpath(dirname($_SERVER['DOCUMENT_ROOT']));
//$docroot = $root . '/appliednerditry';
$docroot = getcwd() . '/..';
$root = $docroot . '/..';

$dir = $docroot . '/chaos/capture/';

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