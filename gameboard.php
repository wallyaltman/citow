<?php
/* http://www.appliednerditry.com/chaos/gameboard.php
 * Created 01 Dec 2010
 *
 * The PHP code for this page retrieves
 * the initial game list, and allows for
 * a link to a specific game and state.
 */

$slash = strpos(getcwd(), '/') === false ? '\\' : '/';
$docroot = realpath(getcwd() . $slash . '..');
$rooturl = 'http://'.$_SERVER['HTTP_HOST'];

$headerurl = realpath($docroot.'/header.php');
include $headerurl;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Chaos in the Old World - Game Board</title>
<?php
$v = 7;
echo '  <link rel="shortcut icon" href="favicon.ico" />'."\n";
echo '  <link rel="stylesheet" href="'.$rooturl.'/style.css" />'."\n";
echo '  <link rel="stylesheet" href="chaos.css?v='.$v.'" />'."\n";
echo '  <script src="'.$rooturl.'/library/jquery-1.6.1.min.js" type="text/javascript"></script>'."\n";
echo '  <script src="'.$rooturl.'/library/myjquery.js" type="text/javascript"></script>'."\n";
echo '  <script src="utility.js" type="text/javascript"></script>'."\n";
echo '  <script src="citow_draw.js" type="text/javascript"></script>'."\n";
echo '  <script src="gameboard.js?v='.$v.'" type="text/javascript"></script>'."\n";
echo '</head>'."\n";
echo '<body id="body">'."\n";
//Header bar is from header.php, included at the top
echo $headerbar;
?>
  <div id="handlebox">
    <div id="activehandle" class="lefthandle">
      <div id="activate" class="handlecontents"></div>
    </div>
    <div id="corrupthandle" class="lefthandle">
      <div id="corruptswitch" class="handlecontents">
<?php
echo '          <img src="'.$rooturl.'/chaos/icons/corruption_txt2.png" id="corrupttext" height="81" width="19" title="Corruption" />'."\n";
?>
      </div>
    </div>
    <div id="scorehandle" class="lefthandle">
      <div id="scoreswitch" class="handlecontents">
<?php      
echo '          <img src="'.$rooturl.'/chaos/icons/scoreboard_txt2.png" id="scoretext" height="86" width="19" title="Scoreboard" />'."\n";
?>
      </div>
    </div>
    <div id="workhandle" class="lefthandle">
      <div id="workswitch" class="handlecontents">
<?php       
echo '        <img src="'.$rooturl.'/chaos/icons/figure_effects_txt2.png" id="worktext" height="102" width="19" title="Figure Effects" />'."\n";
?>
      </div>
    </div>  
  </div>
  <div id="main">
    <div id="corruptbox" class="underbox"></div>
    <div id="scorebox" class="underbox">
      <div id="upgradecontrolbox" class="scoresubbox">
        <table id="upgradecontrol">
          <thead id="upgradehead"></thead>
          <tbody id="upgradebody"></tbody>
        </table>
      </div>
      <div id="scorecontrolbox" class="scoresubbox">
        <table id="scorecontrol">
          <thead id="scorehead"></thead>
          <tbody id="scorebody"></tbody>
        </table>
      </div>
    </div>
    <div id="workbox" class="underbox">
      <canvas id="workshop" class="workshop" width="45" height="75"></canvas>
      <div class="switchbox">
        <div class="effect"></div><div class="effecttext"></div>
        <div class="effect"></div><div class="effecttext"></div>
        <div class="effect"></div><div class="effecttext"></div>
      </div>
    </div>
    <div id="message" class="messagebox underbox">
      <div>
        <div class="messageframe">
          <p id="messagecontent"></p>
          <div id="messagebuttons"></div>
          <p class="messagefoot">Click to close</p>
        </div>
      </div>
    </div>
    <canvas id="board" width="760" height="610">
          <span class="styleme" id="Andika">This page requires support for the HTML5
           canvas element.  Get a better browser!</span>
    </canvas>
    <div id="resetbox">
      <span class="emphasis">Reset PP:</span>
      <div id="resetpp"></div>
      <span class="emphasis">Reset DACs:</span>
      <div id="resetdacs"></div>
    </div>
    <div id="ppbox">
      <div id="inputbox" class="arrows">
        <span id="ppspan" class="emphasis">PP:</span>
      </div>
    </div>
  </div>
  <div id="piecesbox">
    <div>
      <p id="cchead">Chaos Cards</p>
      <p id="owchead">Old World Cards</p>
      <p id="owthead">Old World Tokens</p>
    </div>
    <div>
      <div id="cc1" class="slidedown"></div>
      <div id="cc0" class="slidedown"></div>
    </div>
    <div>
      <div id="owc" class="slidedown"></div>
    </div>
    <div>
      <div id="owt" class="slidedown">
        <canvas id="pool" width="175" height="275">
        </canvas>
      </div>
    </div>
  </div>
  <div class="floatbox buttons clear">
<?php
$dir = $docroot.$slash.'chaos'.$slash.'saves';

$gamenum = $_GET['game'];
$statenum = $_GET['state'];

$matches = array();
$states = array();

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

/***Create the select dropdown for games***/
//Create separate arrays for games
//under and over 1000
$games = array();
$games2 = array();
$tempstates = array();
foreach ($gamefiles as $filename){
    preg_match('/game([0-9]+)state([0-9]+)/', $filename, $matches);
    if ($matches[1] < 1000){
        $games[] = $matches[1];
    }
    else {
        $games2[] = $matches[1];
    }
    $tempstates[] = array($matches[1], $matches[2]);
}
$games = array_unique($games);
sort($games);
//Count the under-1000 games
$len = count($games);
$games2 = array_unique($games2);
sort($games2);
//Append the 1000+ games to the
//end of the array
$games = array_merge($games, $games2);
$gamechoice = ($gamenum == '') ? intval($games[$len - 1]) : intval($gamenum);

echo '    <select id="gamepick">'."\n";
foreach ($games as $x){
    $gameshort = intval($x);
    if ($gameshort == $gamechoice){
        $selected = ' selected="selected"';
    }
    else {
        $selected = '';
    }
    echo '      <option id="game'.$gameshort.'" value="'.$x.'" '.$selected.'>Game '.$gameshort.'</option>'."\n";
}
echo '    </select>'."\n";

//Create the select dropdown for game states

foreach ($tempstates as $xy){
    $gameshort = intval($xy[0]);
    if ($gameshort == $gamechoice){
        $states[] = $xy[1];
    }
}

$states = array_unique($states);
sort($states);
$len = count($states);
$statechoice = ($statenum == '') ? intval($states[$len - 1]) : intval($statenum);

echo '    <select id="statepick">'."\n";
foreach ($states as $x){
    $stateshort = intval($x);
    if ($stateshort == $statechoice){
        $selected = ' selected="selected"';
    }
    else {
        $selected = '';
    }
    echo '      <option id="state'.$stateshort.'" value="'.$x.'" '.$selected.'>State '.$stateshort.'</option>'."\n";
}
if ($userlevel > 0) {
    $disabled = '';
}
else {
    $disabled = ' disabled="disabled"';
}
echo '    </select>'."\n";
echo '    <input type="button" id="drawnow" value="Go!" />'."\n";
echo '    <input type="text" id="savegamenum" class="right" size="4" maxlength="4" />'."\n";
echo '    <input type="button" id="savexmlgame" class="right warn" value="Save as New Game..." '.$disabled.' />'."\n";
echo '    <input type="button" id="savexmlstate" class="right warn" value="Save as" '.$disabled.' />'."\n";
?>
  </div>
  <div class="floatbox buttons clear">
    <div class="spacer"></div>
    <input type="button" id="newboard" value="New Board" />
    <input type="button" id="savepng" class="right" value="Export as .PNG" />
<?php
echo '    <input type="button" id="overwritestate" class="right warn" value="Overwrite" '.$disabled.' />'."\n";
?>
  </div>
  <script>initialize();</script>
</body>
</html>
