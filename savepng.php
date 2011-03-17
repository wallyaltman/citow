<?php
/* This program saves the posted data as
 * a .png image on the server.
 * Created on: 7 Dec 2010
 */

//$root = realpath(dirname($_SERVER['DOCUMENT_ROOT']));
//$docroot = $root . '/appliednerditry';
$docroot = getcwd() . '/..';
$root = $docroot . '/..';

$dir = $docroot . '/chaos/capture/';

//Get the raw POST data
if (isset($GLOBALS["HTTP_RAW_POST_DATA"])){
	// Get the data
	$canvas = $GLOBALS['HTTP_RAW_POST_DATA'];

    //Remove the headers
    $canvasFiltered = substr($canvas, strpos($canvas, ',') + 1);

    //Need to decode before saving since the data 
    //we received is already base64 encoded
    $unencodedData = base64_decode($canvasFiltered);

    //Save the file
    $fp = fopen($dir . 'tmp.png', 'wb');
    fwrite($fp, $unencodedData);
    fclose($fp);

    echo $canvas;
}
?>