<?php
/* http://www.appliednerditry.com/chaos/savexml.php
 * Created 30 Dec 2010
 * This program receives XML data as a string from
 * gameboard.js and saves it as a file on the server.
 */

$slash = strpos(getcwd(), '/') === false ? '\\' : '/';
$docroot = realpath(getcwd() . $slash . '..');

//Set the session path
session_save_path(realpath(dirname($_SERVER['DOCUMENT_ROOT']) . '/../var/php_sessions'));
//Attempt to resume a session
session_start();
$user = $_SESSION['username'];
$userlevel = $_SESSION['privileges'];
//Set the save directory
$dir = realpath(getcwd() . $slash . 'saves') . $slash;
//Retrieve the POST variables
$game = $_POST['game'];
$state = $_POST['state'];
$submituser = $_POST['user'];
$overwrite = ($_POST['over'] == 1) ? true : false;
$data = stripslashes($_POST['data']);
//Generate the file name
while (strlen($game) < 4){
    $game = '0'.$game;
}
while (strlen($state) < 2){
    $state = '0'.$state;
}
$file = 'game' . $game . 'state' . $state . '.xml';

$fail = false;
//User verification, etc.
if (!isset($_SESSION['username'])){
    $fail = true;
    $returnmsg = 'ERROR: Not logged in';
}
else if (strtolower($user) != strtolower($submituser)){
    $fail = true;
    $returnmsg = 'ERROR: User name mismatch';
}
else if ($state == 1 && $game < 1000 && $userlevel < 2){
    $fail = true;
    $returnmsg = 'ERROR: Insufficient user permissions';
}
//Check for an existing file with the
//same game & state numbers
else if (file_exists($dir.$file) && !$overwrite){
    $fail = true;
    $returnmsg = 'ERROR: Specified gamestate file already exists';
}
//Check whether the preceding state file exists, and
//if present, whether the creator matches the user
else if (($state > 1 || $overwrite) && $userlevel < 3){
    $prevstate = $overwrite ? $state : $state - 1;
    while (strlen($prevstate) < 2){
        $prevstate = '0'.$prevstate;
    }
    $prevfile = 'game' . $game . 'state' . $prevstate . '.xml';
    if (file_exists($dir.$prevfile)){
        $xmlprev = new XMLReader();
        $xmlprev->open($dir.$prevfile);
        if ($xmlprev->read() && $xmlprev->moveToAttribute('creator')){
            $creator = $xmlprev->value;
            if (strtolower($user) != strtolower($creator)){
                $fail = true;
                $returnmsg = 'ERROR: User name mismatch';
            }
        }
    }
    else {
        $fail = true;
        $returnmsg = 'ERROR: Out-of-sequence state number';
    }
}
//Write the XML as a new file
if (!$fail){
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

    //Remove the existing file (if any) before writing
    if (file_exists($dir.$file)){
        unlink($dir.$file);
    }

    file_put_contents($dir.$file, '<?xml version="1.0" encoding="UTF-8" ?>'."\n".$data, LOCK_EX);
    if (file_exists($dir.$file) && simplexml_load_file($dir.$file)){
        $returnmsg = 'Success!';
    }
    else {
        $returnmsg = 'ERROR: Problem writing file';
    }
}
echo $returnmsg;
?>
