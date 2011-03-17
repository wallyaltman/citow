<?php
/* This program returns a list of games or gamestates
 * to gameboard.js
*/

//$root = realpath(dirname($_SERVER['DOCUMENT_ROOT']));
//$docroot = $root . '/appliednerditry';
$docroot = getcwd() . '/..';
$root = $docroot . '/..';

$dir = $docroot . '/chaos/saves/';

$request = $_GET['req'];
$gamenum = $_GET['gamenum'];

//Read the file list
$files = array();
if ($handle = opendir($dir)){
    while (false !== ($filename = readdir($handle))){
        $files[] = $filename;
    }
    closedir($handle);
}

//Identify CitOW game files

$gamefiles = preg_grep('/game[0-9]+state[0-9]+\.xml/', $files);

//Pull and return the games list or the states list
//for a given game, depending on the request

$matches = array();
if ($request == 'games'){
    //Create separate arrays for games
    //under and over 1000
    $games = array();
    $games2 = array();
    foreach ($gamefiles as $filename){
        preg_match('/game([0-9]+)/', $filename, $matches);
        if ($matches[1] < 1000){
            $games[] = $matches[1];
        }
        else {
            $games2[] = $matches[1];
        }
    }
    $games = array_unique($games);
    sort($games);
    $games2 = array_unique($games2);
    sort($games2);
    //Append the 1000+ games to the
    //end of the array
    $games = array_merge($games, $games2);
    echo json_encode($games);
}
elseif ($request == "states"){
    $states = array();
    foreach ($gamefiles as $filename){
        preg_match('/game([0-9]+)state([0-9]+)/', $filename, $matches);
        if ($matches[1] == $gamenum){
            $states[] = $matches[2];
        }
    }
    $states = array_unique($states);
    sort($states);
    echo json_encode($states);
}
?>