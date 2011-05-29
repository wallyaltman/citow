<?php
/**
 * http://www.appliednerditry.com/chaos/index.php
 * Created 23 May 2011
 *
 * This page shows the game index, and provides
 * options for creating a new game.
 */

$slash = strpos(getcwd(), '/') === false ? '\\' : '/';
$docroot = realpath(getcwd() . $slash . '..');
$rooturl = 'http://'.$_SERVER['HTTP_HOST'];

//Set the save directory
$dir = realpath($docroot . '/chaos/saves/') . '/';

//Set the session path
session_save_path($docroot . '/../var/php_sessions');

//Attempt to resume a session
session_start();
if (isset($_SESSION['username'])){
    $user = $_SESSION['username'];
    $userlevel = $_SESSION['privileges'];
}

//Retrieve the POST variables
$game = $_POST['gamenumber'];
$players = array();
$powerlist = array('khorne', 'nurgle', 'tzeentch', 'slaanesh', 'hornedrat');
foreach ($powerlist as $power){
    $checked = (bool) $_POST[$power];
    if ($checked){
      $players[$power] = $_POST['player_' . $power] || '';
    }
}
$ccardset = $_POST['ccardset'];
$owcardset = $_POST['owcardset'];
$owtokens = $_POST['owtokens'];

//Generate the file name
while (strlen($game) < 4){
    $game = '0'.$game;
}
$state = '01';
$file = 'game' . $game . 'state' . $state . '.xml';

//User verification, etc.
if (!isset($_SESSION['username'])){
    $fail = true;
    $returnmsg = 'ERROR: Not logged in';
}
else if ($game < 1000 && $userlevel < 2){
    $fail = true;
    $returnmsg = 'ERROR: Insufficient user permissions';
}
//Check for an existing file with the
//same game & state numbers
else if (file_exists($dir.$file)){
    $fail = true;
    $returnmsg = 'ERROR: Specified game already exists';
}
//Check the HTTP_REFERER header, and fail if it's no good
if (isset($_SERVER['HTTP_REFERER'])){
    $domain = parse_url($_SERVER['HTTP_REFERER']);
    $hostlist = array('localhost', 'www.appliednerditry.com', 'appliednerditry.com', 'appliednerditry.wallyaltman.com');
    if (in_array(strtolower($domain['host']), $hostlist)){
        $host = $_SERVER['HTTP_HOST'];
        $uri = $host . rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
    }
}    

//Read in the blank board, edit it a bit, then write
//it out as a new file
if (!$fail){
    //Read the blank game file
    $newgame = new DOMDocument(); //HERE
    $newgame->load('./gamedata/blankboard.xml');
    //Insert player names and get token setup modifiers
    //for players who are in the game.  Delete entries
    //for powers not being played.
    $playernodelist = $newgame->getElementsByTagName('player');
    $playernodecount = $playernodelist->length;
    $setupmods = array();
    for ($i = 0; $i < $playernodecount; $i++){
        $playernode = $playernodelist->item($i);
        $power = $playernode->getAttribute('name');
        if (isset($players[$power])){
            //Set the player name
            $playernode->setAttribute('playername', $players[$power]);
            //Look for setup modifiers
            $playersetuplist = $playernode->getElementsByTagName('setup')->item(0)->childNodes;
            $setupcount = $playersetuplist->length;
            if ($setupcount > 0){
                for ($j = 0; $j < $setupcount; $j++){
                    $setupitem = $playersetuplist->item($j);
                    $setupitemname = $setupitem->nodeName;
                    if (!isset($setupmods[$setupitemname])){
                        $setupmods[$setupitemname] = 0;
                    }
                    $setupmods[$setupitemname] += $setupitem->textContent;
                }
            }
        }
        else {
            $playernodelist->removeChild($playernode);
        }
    }
    //If automatic Old World token placement was requested,
    //read token counts and any player-based modifiers
    if (strtolower($owtokens) == 'auto'){
        //Get the list of setup tokens
        $setup = $newgame->getElementsByTagName('setup')->item(0)->childNodes;
        $setuplength = $setup->length;
        $setuptokens = array();
        //Turn the list of tokens w/ counts into a stack
        //of tokens
        for ($i = 0; $i < $setuplength; $i++){
            $tokenname = $setup->item($i)->nodeName;
            $tokencount = $setup->item($i)->textContent;
            if (is_numeric($tokencount) && $tokencount > 0){
                //If there was a modifier, use it
                if (isset($setupmods[$tokenname])){
                    $tokencount += $setupmods[$tokenname];
                }
                //Put some tokens on the stack
                for ($j = 0; $j < $tokencount; $j++){
                    $setuptokens[] = $tokenname;
                }
            }
        }
        //Shuffle the starting tokens
        $shuffle($setuptokens);
        //Get the region list
        $regionlist = $newgame->getElementsByTagName('region');
        $regioncount = $regionlist->length;
        //Place tokens until either tokens or regions run out
        for ($i = 0; $i < $regioncount; $i++){
            if (count($setuptokens) == 0){
                break;
            }
            $tokendrop = $regionlist->item($i)->getElementsByTagName('tokens')->item(0);
            $token = $newgame->createElement(array_pop($setuptokens));
            $tokendrop->appendChild($token);
        }
    }
    //Set the game and state number, game creator, and expansion name
    $newgame->setAttribute('creator', $user);
    $newgame->setAttribute('game', $game);
    $newgame->setAttribute('state', 1);
    if (strtolower($ccardset) == 'morrslieb'){
        $newgame->setAttribute('expansion', 'morrslieb');
    }
    //Set the Old World card set
    $newgame->getElementsByTagName('oldworld')->item(0)->setAttribute('set', $owcardset);
    //Dump the XML data to a string
    $data = $newgame->saveXML();
    //Prettify the data
    /*Pretty-print code from: http://gdatatips.blogspot.com/2008/11/xml-php-pretty-printer.html */
    $xmlarray = explode("\n", preg_replace('/>\s*</', ">\n<", $data));
    $pretty = array();
    $level = 2;  //indent width
    $indent = 0; //current indentation level
    foreach ($xmlarray as $el) {
        if (preg_match('/^<([\w])+[^>\/]*>$/U', $el)) {
            // opening tag, increase indent
            $pretty[] = str_repeat(' ', $indent) . $el;
            $indent += $level;
        } 
        else {
            if (preg_match('/^<\/.+>$/', $el)) {            
                $indent -= $level;  // closing tag, decrease indent
            }
            if ($indent < 0) {
                $indent += $level;
            }
            $pretty[] = str_repeat(' ', $indent) . $el;
        }
    }
    $data = implode("\n", $pretty);
    //Write out the save file
    file_put_contents($dir.$file, '<?xml version="1.0" encoding="UTF-8" ?>'."\n".$data, LOCK_EX);
    if (file_exists($dir.$file) && simplexml_load_file($dir.$file)){
        //If successful, load the new game at gameboard.php
        header( 'Location: ' . $uri . '/gameboard.php?game=' . $game );
    }
    else {
        $returnmsg = 'ERROR: Problem writing file';
    }
}
//If we failed somehow, return to the index page with
//the error message
if (isset($returnmsg)){
    $_SESSION['message'] = $returnmsg;
}
?>