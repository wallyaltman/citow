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
session_save_path(realpath(dirname($_SERVER['DOCUMENT_ROOT']) . '/../var/php_sessions'));

//Attempt to resume a session
session_start();
if (isset($_SESSION['username'])){
    $user = $_SESSION['username'];
    $userlevel = $_SESSION['privileges'];
}

//Retrieve the POST variables
$game = $_POST['gamenumber'];
$players = array();
$powerlist = array('khorne', 'nurgle', 'tzeentch', 'slaanesh', 'horned_rat');
foreach ($powerlist as $power){
    $checked = (isset($_POST[$power]))
                     ? ($_POST[$power] == '1')
                     : false;
    if ($checked){
      $players[$power] = $_POST['player_' . $power];
    }
}
$ccardset = $_POST['ccardset'];
$owcardset = $_POST['owcardset'];
$owtokens = $_POST['owtokens'];
$threadnum = $_POST['threadnum'];

//Generate the file name
while (strlen($game) < 4){
    $game = '0'.$game;
}
$state = '01';
$file = 'game' . $game . 'state' . $state . '.xml';

$fail = false;
//User verification, etc.
if (!isset($_SESSION['username'])){
    $fail = true;
    $error = '01'; //Not logged in
}
else if (!isset($game)){
    $fail = true;
    $error = '12'; //No game number given
}
else if ($game < 1000 && $userlevel < 2){
    $fail = true;
    $error = '02'; //Insufficient user permissions
}
//Check for an existing file with the
//same game & state numbers
else if (file_exists($dir.$file)){
    $fail = true;
    $error = '11'; //Game already exists
}
//Check the HTTP_REFERER header, and fail if it's no good
if (isset($_SERVER['HTTP_REFERER'])){
    $domain = parse_url($_SERVER['HTTP_REFERER']);
    $hostlist = array('localhost', 'www.appliednerditry.com', 'appliednerditry.com', 'appliednerditry.wallyaltman.com');
    $matches = array();
    preg_match('/^(\/chaos(dev)?)/', $domain['path'], $matches);
    $path = (isset($matches[1]) && $matches[1] !== '')
                  ? $matches[1]
                  : '/chaos';
    if (!in_array(strtolower($domain['host']), $hostlist)){
        $fail = true;
        $error = '07'; //Invalid referer
        $uri = 'http://appliednerditry.com/chaos';
    }
    else {
        $uri = 'http://' . $domain['host'] . $path;
    }
}


//Read in the blank board, edit it a bit, then write
//it out as a new file
if (!$fail){
    //Read the blank game file
    $newgame = new DOMDocument(); //HERE
    $newgame->load('./gamedata/blankboard.xml');
    //Insert player names and get token setup modifiers
    //for players who are in the game.
    $playernodelist = $newgame->getElementsByTagName('player');
    $playernodecount = $playernodelist->length;
    $playerstodelete = array();
    for ($i = 0; $i < $playernodecount; $i++){
        $playernode = $playernodelist->item($i);
        $power = strtolower($playernode->getAttribute('name'));
        if (isset($players[$power])){
            //Set the player name
            $playernode->setAttribute('playername', $players[$power]);
        }
        else {
            $playerstodelete[] = $i;
        }
    }
    //Delete entries for powers not being played.
    arsort($playerstodelete);
    $scoreboard = $newgame->getElementsByTagName('scoreboard')->item(0);
    foreach($playerstodelete as $deletekey){
        $scoreboard->removeChild($playernodelist->item($deletekey));
    }
    //Get the list of setup tokens
    $setup = $newgame->getElementsByTagName('setup');
    $setuplength = $setup->length;
    //If automatic Old World token placement was requested,
    //read token counts and any player-based modifiers
    if (strtolower($owtokens) == 'auto'){
        //Make a list of token names
        $setuptokencounts = array('event'=>0, 'hero'=>0, 'noble'=>0, 'peasant'=>0, 'skaven'=>0, 'warpstone'=>0);
        foreach($setuptokencounts as $tokenname => $tokencount){
            //Run through each setup element and pull tokens
            for ($i = 0; $i < $setuplength; $i++){
                $thistokenlist = $setup->item($i)->getElementsByTagName($tokenname);
                if ($thistokenlist->length > 0){
                    $setuptokencounts[$tokenname] += $thistokenlist->item(0)->textContent;
                }
            }
        }
        //Turn the list of tokens w/ counts into a stack
        //of tokens
        $setuptokens = array();
        foreach($setuptokencounts as $tokenname => $tokencount){
            if ($tokencount > 0){
                //Put some tokens on the stack
                for ($i = 0; $i < $tokencount; $i++){
                    $setuptokens[] = $tokenname;
                }
            }
        }
        //Shuffle the starting tokens
        shuffle($setuptokens);
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
    //Remove the token setup data
    for ($i = $setuplength - 1; $i >= 0; $i--){
        $thissetup = $setup->item($i);
        $thissetupparent = $thissetup->parentNode;
        $thissetupparent->removeChild($thissetup);
    }
    //Set the game and state number, game creator, and expansion name
    $documentnode = $newgame->getElementsByTagName('boardstate')->item(0);
    $documentnode->setAttribute('creator', $user);
    $documentnode->setAttribute('game', $game);
    $documentnode->setAttribute('state', 1);
    if (strtolower($ccardset) == 'morrslieb'){
        $documentnode->setAttribute('expansion', 'morrslieb');
    }
    if (isset($threadnum) && strlen($threadnum) >= 5){
        $documentnode->setAttribute('thread', $threadnum);
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
    file_put_contents($dir.$file, $data, LOCK_EX);
    if (file_exists($dir.$file) && simplexml_load_file($dir.$file)){
        //If successful, update the JSON game lists
        //and then load the new board.
        include 'gamelist_q.php';
        header( 'Location: ' . $uri . '/gameboard.php?game=' . $game );
    }
    else {
        $error = '51';
    }
}
//If we failed somehow, return to the index page with
//the error message
if (isset($error)){
    header('Location: ' . $uri . '/index.php?error=' . $error);
}
?>

