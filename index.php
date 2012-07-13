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

$headerurl = realpath($docroot.'/header.php');
include $headerurl;

//Set the save directory
$dir = realpath(getcwd() . $slash . 'saves');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Chaos in the Old World - AppliedNerditry.com</title>
<?php
echo '  <link rel="shortcut icon" href="favicon.ico" />', "\n";
echo '  <link rel="stylesheet" href="', $rooturl, '/style.css" />', "\n";
echo '  <link rel="stylesheet" href="chaos.css" />', "\n";
echo '  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>'."\n";
echo '  <script src="index.js" type="text/javascript"></script>', "\n";
echo '</head>'."\n";
echo '<body id="body">'."\n";
//Header bar is from header.php, included at the top
echo $headerbar;
?>
<?php
//Display current time
echo '  <time datetime="', date(DATE_ATOM), '">Current server time: ',
     date('g:i A T'), '</time>', "\n";
?>
  <h1>Chaos in the Old World Board Manager</h1>
  <div id="contentbox">
    <section>
      <h1>Create a New Game</h1>
<?php
//Display a message, if there is one
if (isset($_GET['error'])){
    $errorcode = $_GET['error'];
    //Create a table of error messages
    $errorlist = array( '01'=>'ERROR: Not logged in', '02'=>'ERROR: Insufficient user permissions',
                        '07'=>'ERROR: Invalid HTTP referer',
                        '11'=>'ERROR: File already exists', '12'=>'ERROR: No game number provided',
                        '51'=>'ERROR: Unknown I/O error');
    $message = $errorlist[$errorcode];
    $messageclass = is_numeric($errorcode)
                      ? 'errormsg msg'
                      : 'msg';              //Always true (so far)
    echo '      <p class="', $messageclass, '">', $message, '</p>', "\n";
}
?>
      <form action="newgame.php" method="post">
        <div>
          <fieldset>
            <legend>Powers</legend>
            <ol>
              <li>
                <input type="checkbox" id="khorne" name="khorne" checked="checked" value="1" />
                <label for="khorne">Khorne</label>
                <input type="text" id="player_khorne" name="player_khorne" placeholder="Name of the Khorne player" size="30" />
              </li>
              <li>
                <input type="checkbox" id="nurgle" name="nurgle" checked="checked" value="1" />
                <label for="nurgle">Nurgle</label>
                <input type="text" id="player_nurgle" name="player_nurgle" placeholder="Name of the Nurgle player" size="30" />
              </li>
              <li>
                <input type="checkbox" id="tzeentch" name="tzeentch" checked="checked" value="1" />
                <label for="tzeentch">Tzeentch</label>
                <input type="text" id="player_tzeentch" name="player_tzeentch" placeholder="Name of the Tzeentch player" size="30" />
              </li>
              <li>
                <input type="checkbox" id="slaanesh" name="slaanesh" checked="checked" value="1" />
                <label for="slaanesh">Slaanesh</label>
                <input type="text" id="player_slaanesh" name="player_slaanesh" placeholder="Name of the Slaanesh player" size="30" />
              </li>
              <li>
                <input type="checkbox" id="horned_rat" name="horned_rat" checked="checked" value="1" />
                <label for="horned_rat">The Horned Rat</label>
                <input type="text" id="player_horned_rat" name="player_horned_rat" placeholder="Name of the Horned Rat player" size="30" />
              </li>
            </ol>
          </fieldset>
          <fieldset>
            <legend>Chaos Cards &amp; Upgrades</legend>
            <input type="radio" id="ccardsetbase" name="ccardset" />
            <label for="ccardsetbase">CitOW</label>
            <input type="radio" id="ccardsetmorrslieb" name="ccardset" checked="checked" value="morrslieb"/>
            <label for="ccardsetmorrslieb">The Horned Rat</label>
          </fieldset>
          <fieldset>
            <legend>Old World Card Set</legend>
            <input type="radio" id="owcardsetbase" name="owcardset" value='citow' />
            <label for="owcardsetbase">CitOW Only</label>
            <input type="radio" id="owcardsetall" name="owcardset" checked="checked" value="all" />
            <label for="owcardsetall">CitOW + The Horned Rat</label>
            <input type="radio" id="owcardsetmorrslieb" name="owcardset" value="morrslieb" />
            <label for="owcardsetmorrslieb">The Horned Rat Only</label>
          </fieldset>
        </div>
        <fieldset>
          <legend>Game Number</legend>
          <input type="number" id="gamenumber" name="gamenumber" required="required" />
<?php
$disabled = $userlevel > 1 ? '' : 'disabled="disabled" ';
echo '          <input type="radio" id="officialgame" name="gamerank" ', $disabled, '/>', "\n";
?>
          <label for="officialgame">Official CF Game</label>
          <input type="radio" id="othergame" name="gamerank" checked="checked" />
          <label for="othergame">Unofficial Game</label>
<?php
echo '          <img src="', $rooturl, '/graphics/check23.png" id="checkgame"',
     ' height="23" width="23" alt="Game number is OK" class="hideme" />', "\n";
echo '          <img src="', $rooturl, '/graphics/error23.png" id="errorgame" height="23"',
     ' width="23" alt="Game number is too low or already taken" class="hideme" />', "\n";
?>
        </fieldset>
        <fieldset>
          <legend>Initial Old World Token Placement</legend>
          <input type="radio" id="owtokensyes" name="owtokens" checked="checked" value="auto" />
          <label for="owtokensyes">Automatic</label>
          <input type="radio" id="owtokensno" name="owtokens" value="manual" />
          <label for="owtokensno">Manual</label>
        </fieldset>
        <fieldset novalidate="novalidate">
          <legend>PA Forums Game Thread</legend>
          <input type="url" id="pathread" name="pathread" size="80" />
<?php
echo '          <img src="', $rooturl, '/graphics/check23.png" id="checkthread"',
     ' height="23" width="23" alt="Game number is OK" class="hideme" />', "\n";
echo '          <img src="', $rooturl, '/graphics/error23.png" id="errorthread" height="23"',
     ' width="23" alt="Game number is too low or already taken" class="hideme" />', "\n";
?>
        <input type="hidden" id="threadnum" name="threadnum" />
        </fieldset>
        <fieldset>
          <input type="submit" id="submit" />
        </fieldset>
      </form>
    </section>
<?php
//Read in the game metadata, generating it first
//if necessary
if (!file_exists($dir.'owned_games.json')){
    include "gamelist.php";
}
$rawdata = file_get_contents($dir.'owned_games.json');
$jsondata = json_decode($rawdata);
//Determine whether to show "test" games (> 1000)
$showtest = (isset($_GET['test']) && strtolower($_GET['test'])=== 'true');
$testget = $showtest ? '&test=true' : '';
//See if the "my games" section should be expanded
$expmy = (isset($_GET['my']) && strtolower($_GET['my']) === 'true');
$expmyget = $expmy ? '&my=true' : '';
//See if the "recent" section should be expanded
$expall = (isset($_GET['al']) && strtolower($_GET['al']) === 'true');
$expallget = $expall ? '&al=true' : '';
//Split off date modified, and sort descending
$gamedata = array();
$moddates = array();
if ($showtest){
    foreach ($jsondata as $gnum => $row){
        $gamedata[$gnum] = $row;
        $moddates[$gnum] = $row->modified;
    }
}
else {
    foreach ($jsondata as $gnum => $row){
        if ($gnum < 1000){
            $gamedata[$gnum] = $row;
            $moddates[$gnum] = $row->modified;
        }
    }
}
arsort($moddates);

//Create an array of formatted data rows, and if a
//user is logged in, a subset with their games
$allrows = array();
$myrows = array();
$today = new DateTime('today');
$yesterday = new DateTime('yesterday');
$monthsago = new DateTime('10 months ago');
foreach ($moddates as $gnum => $modtime){
    $modtimeobj = new DateTime('@'.$modtime);
    $modtimeobj->setTimezone(new DateTimeZone('America/New_York'));
    $creator = $gamedata[$gnum]->creator;
    $expansion = (isset($gamedata[$gnum]->expansion))
                       ? $gamedata[$gnum]->expansion
                       : '';
    $threadnum = $gamedata[$gnum]->thread;
    $threadurl = isset($threadnum)
                       ? 'http://forums.penny-arcade.com/discussion/' . $threadnum
                       : '';
    if ($modtimeobj > $today){
        $modstring = $modtimeobj->format('g:i A');
    }
    else if ($modtimeobj > $yesterday){
        $modstring = "yesterday at " . $modtimeobj->format('g:i A');
    }
    else if ($modtimeobj > $monthsago){
        $modstring = $modtimeobj->format('F j \a\\t g:i A');
    }
    else {
        $modstring = $modtimeobj->format('F j, Y \a\\t g:i A');
    }
    $thisrow = array('game' => $gnum,
                     'creator' => $creator,
                     'expansion' => $expansion,
                     'threadurl' => $threadurl,
                     'modified' => $modstring);
    $allrows[] = $thisrow;
    if ($creator === $user){
        $myrows[] = $thisrow;
    }
}

//List the current user's recent games, if any
if (count($myrows) > 0){
    echo '    <section>', "\n";
    echo '      <h1>My Games</h1>', "\n";
    $rowcounter = 0;
    $hidestring = '';
    foreach ($myrows as $row){
        $expstring = $row['expansion'] == 'morrslieb' ? ' (The Horned Rat)' : '';
        $threadstring = $row['threadurl'] == ''
                          ? ''
                          : '<a class="thread" href="' . $row['threadurl'] . '">(game&nbsp;thread)</a>';
        echo '        <p', $hidestring, '><a href="gameboard.php?game=',
             $row['game'], '">', 'Game ', $row['game'], '</a>', $expstring,
             ': last modified ', $row['modified'], $threadstring, '</p>', "\n";
        $rowcounter += 1;
        //Hide games after 5 by default
        if ($rowcounter == 5 && !$expmy){
            $hidestring = ' class="hideme"';
        }
    }
    //Make a link to show less or more games
    if ($rowcounter > 5){
        //Pass along current GET values of other fields
        $args = $testget . $expallget;
        if (!$expmy){
            echo '        <a class="more" href="index.php?my=true', $args,
                 '">More...</a>', "\n";
        }
        else {
            echo '        <a class="more" href="index.php?my=', $args,
                 '">Less...</a>', "\n";
        }
    }
    //Make a link to show or hide test games
    $args = $expmyget . $expallget;
    if (!$showtest){
        echo '        <a class="more" href="index.php?test=true', $args,
             '">Show games &gt 1000</a>', "\n";
    }
    else {
        echo '        <a class="more" href="index.php?test=', $args,
             '">Hide games &gt 1000</a>', "\n";
    }
    echo '    </section>', "\n";
}

?>
    <section>
      <h1>Recent Activity</h1>
<?php
//See if the "recent" section should be expanded
$rowcounter = 0;
$hidestring = '';
//List all recent games
foreach ($allrows as $row){
    $expstring = $row['expansion'] == 'morrslieb' ? ' (The Horned Rat)' : '';
        $threadstring = $row['threadurl'] == ''
                          ? ''
                          : '<a class="thread" href="' . $row['threadurl'] . '">(game&nbsp;thread)</a>';
    echo '        <p', $hidestring, '><a href="gameboard.php?game=', $row['game'],
         '">','Game ', $row['game'], '</a>', $expstring, ': last modified by ',
         $row['creator'], ', ', $row['modified'], $threadstring, '</p>', "\n";
    $rowcounter += 1;
    //Hide games after 5 by default
    if ($rowcounter == 5 && !$expall){
        $hidestring = ' class="hideme"';
    }
}
//Make a link to show less or more games
if ($rowcounter > 5){
    //Pass along current GET values of other fields
    $args = $testget . $expmyget;
    if (!$expall){
        echo '        <a class="more" href="index.php?al=true', $args,
             '">More...</a>', "\n";
    }
    else {
        echo '        <a class="more" href="index.php?al=', $args,
             '">Less...</a>', "\n";
    }
}
//Make a link to show or hide test games
$args = $expmyget . $expallget;
if (!$showtest){
    echo '        <a class="more" href="index.php?test=true', $args,
         '">Show games &gt 1000</a>', "\n";
}
else {
    echo '        <a class="more" href="index.php?test=', $args,
         '">Hide games &gt 1000</a>', "\n";
}
echo '    </section>', "\n";
?>
    </section>
  </div>
</body>
</html>

