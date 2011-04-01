<?php
/* This program generates a list of games/gamestates
 * and stores it on the server in JSON format, as
 * well as returning the list.
 */

$slash = strpos(getcwd(), '/') === false ? '\\' : '/';
$docroot = realpath(getcwd() . $slash . '..');

$dir = realpath($docroot . '/chaos/saves/') . '/';

//Read the file list
$files = array();
if ($handle = opendir($dir)){
    while (false !== ($filename = readdir($handle))){
        $files[] = $filename;
    }
    closedir($handle);
}
//Identify game saves
$gamefiles = preg_grep('/game[0-9]+state[0-9]+\.xml/', $files);
//Put games and saves into a
//two-dimensional array
$games = array();
$matches = array();
foreach ($gamefiles as $filename){
    if (preg_match('/game([0-9]+)state([0-9]+)/', $filename, $matches)){
        $gnum = (int) $matches[1];
        $snum = (int) $matches[2];
        if (!isset($games[$gnum])){
            $games[$gnum] = array();
        }
        $games[$gnum][] = $snum;
    }
}
//Sort the states in each game
foreach ($games as &$states){
    sort($states);
}
//Sort the games
ksort($games);
//Write out the list
$file = 'save_manifest.json';
$output = json_encode($games);
file_put_contents($dir.$file, $output, LOCK_EX);
if (file_exists($dir.$file)){
    $returnmsg = $output;
}
else {
    $x = new stdClass();
    $returnmsg = json_encode($x);
}
echo $returnmsg;
?>