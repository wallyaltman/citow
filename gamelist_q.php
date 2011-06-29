<?php
/* This program generates a list of games/gamestates
 * and stores it on the server in JSON format, as
 * well as returning the list.  This "_q" version
 * doesn't return any response.
 */

$slash = strpos(getcwd(), '/') === false ? '\\' : '/';
$docroot = realpath(getcwd() . $slash . '..');

$dir = realpath($docroot . '/chaos/saves/') . '/';

$quiet = ($_GET['quiet'] == 'true');

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
//Put games and saves into a two-dimensional array.
//Also create an array of "last modified" times.
$games = array();
$matches = array();
$modtimes = array();
foreach ($gamefiles as $filename){
    if (preg_match('/game([0-9]+)state([0-9]+)/', $filename, $matches)){
        $gnum = (int) $matches[1];
        $snum = (int) $matches[2];
        if (!is_array($games[$gnum])){
            $games[$gnum] = array();
        }
        $games[$gnum][] = $snum;
        $currentmodtime = filemtime($dir.$filename);
        if ($currentmodtime > $modtimes[$gnum] || !isset($modtimes[$gnum])){
            $modtimes[$gnum] = $currentmodtime;
        }
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

//Create a list of games and their owners
$gamestarts = array();
$xmlgame = new XMLReader();
//Identify first saves
$gamestartfiles = preg_grep('/game[0-9]+state0*1\.xml/', $files);
foreach ($gamestartfiles as $filename){
    if (preg_match('/game([0-9]+)/', $filename, $matches)){
        $gnum = (int) $matches[1];
        $xmlgame->open($dir.$filename);
        if ($xmlgame->read() && $xmlgame->moveToAttribute('creator')){
            $gamestarts[$gnum] = array();
            $gamestarts[$gnum]['creator'] = $xmlgame->value;
            if ($xmlgame->moveToAttribute('expansion')){
                $gamestarts[$gnum]['expansion'] = $xmlgame->value;
            }
            if ($xmlgame->moveToAttribute('thread')){
                $gamestarts[$gnum]['thread'] = $xmlgame->value;
            }
            $gamestarts[$gnum]['modified'] = $modtimes[$gnum];
        }
        $xmlgame->close();
    }
}
ksort($gamestarts);
//Write out the game/owner list
$ownerfile = 'owned_games.json';
$owneroutput = json_encode($gamestarts);
file_put_contents($dir.$ownerfile, $owneroutput, LOCK_EX);
?>
