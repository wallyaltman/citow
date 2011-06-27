<?php
/* This program saves the posted data as
 * a .png image on the server.
 * Created on: 7 Dec 2010
 */

$slash = strpos(getcwd(), '/') === false ? '\\' : '/';
$docroot = realpath(getcwd() . $slash . '..');

$dir = realpath($docroot.'/chaos/capture/').'/';

//Get the raw POST data
$canvas = urldecode(file_get_contents("php://input"));

//debug data
$fp = fopen($dir . 'check.txt', 'w');
fwrite($fp, $canvas . "\n");
fclose($fp);

if (isset($canvas)){
    //Remove the headers
    $canvasFiltered = substr($canvas, strpos($canvas, ',') + 1);

    //Need to decode before saving since the data 
    //we received is already base64 encoded
    $unencodedData = base64_decode($canvasFiltered);

    //Save the file
    $fp = fopen($dir . 'tmp0.png', 'wb');
    fwrite($fp, $unencodedData);
    fclose($fp);
    
    //Convert the image to use an indexed colormap,
    //no dithering, 128 colors (to save space)
    $command = 'convert '.$dir.'tmp0.png -dither None -colors 256 '.$dir.'tmp.png';
    exec($command);

    echo $canvas;
}
else {
    //Write debug data to a file
    $fp = fopen($dir . 'fail.txt', 'w');
    fwrite($fp, "It did not work" . "\n");
    fclose($fp);
}
?>
