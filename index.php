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
$dir = realpath($docroot.'/chaos/saves/').'/';
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
echo '  <script src="', $rooturl, '/library/jquery-1.6.1.min.js" type="text/javascript"></script>', "\n";
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
      <form action="newgame.php" method="post">
        <fieldset>
          <legend>Powers</legend>
          <ol>
            <li>
              <input type="checkbox" id="khorne" name="khorne" checked="checked" />
              <label for="khorne">Khorne</label>
              <input type="text" name="player_khorne" placeholder="Name of the Khorne player" size="30" />
            </li>
            <li>
              <input type="checkbox" id="nurgle" name="nurgle" checked="checked" />
              <label for="nurgle">Nurgle</label>
              <input type="text" name="player_nurgle" placeholder="Name of the Nurgle player" size="30" />
            </li>
            <li>
              <input type="checkbox" id="tzeentch" name="tzeentch" checked="checked" />
              <label for="tzeentch">Tzeentch</label>
              <input type="text" name="player_tzeentch" placeholder="Name of the Tzeentch player" size="30" />
            </li>
            <li>
              <input type="checkbox" id="slaanesh" name="slaanesh" checked="checked" />
              <label for="slaanesh">Slaanesh</label>
              <input type="text" name="player_slaanesh" placeholder="Name of the Slaanesh player" size="30" />
            </li>
            <li>
              <input type="checkbox" id="hornedrat" name="hornedrat" checked="checked" />
              <label for="hornedrat">The Horned Rat</label>
              <input type="text" name="player_hornedrat" placeholder="Name of the Horned Rat player" size="30" />
            </li>
          </ol>
        </fieldset>
        <fieldset>
          <legend>Card Set</legend>
          <input type="radio" id="cardsetbase" name="cardset" />
          <label for="cardsetbase">Base Game</label>
          <input type="radio" id="cardsetmorrslieb" name="cardset" checked="checked" value="morrslieb" />
          <label for="cardsetmorrslieb">Morrslieb</label>
        </fieldset>
        <fieldset>
          <legend>Game Number</legend>
          <input type="number" id="gamenumber" name="gamenumber" />
<?php
$disabled = $userlevel > 1 ? '' : 'disabled="disabled" ';
echo '          <input type="radio" id="officialgame" name="gamerank" ', $disabled, '/>', "\n";
?>
          <label for="officialgame">Official CF Game</label>
          <input type="radio" id="othergame" name="gamerank" checked="checked" />
          <label for="othergame">Unofficial Game</label>
<?php
echo '          <img src="', $rooturl, '/graphics/check.png" id="check" height="31" width="31" alt="Game number is OK" class="hideme" />', "\n";
echo '          <img src="', $rooturl, '/graphics/error.png" id="error" height="31" width="31" alt="Game number is too low or already taken" class="hideme" />', "\n";
?>
        </fieldset>
        <fieldset>
          <input type="submit" />
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
$showtest = (strtolower($_GET['test']) === 'true');
$testget = $showtest ? '&test=true' : '';
//See if the "my games" section should be expanded
$expmy = (strtolower($_GET['my']) === 'true');
$expmyget = $expmy ? '&my=true' : '';
//See if the "recent" section should be expanded
$expall = (strtolower($_GET['al']) === 'true');
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
                     'expansion' => $gamedata[$gnum]->expansion,
                     'modified' => $modstring);
    $allrows[] = $thisrow;
    if ($creator === $user){
        $myrows[] = $thisrow;
    }
}

//List the current user's recent games, if any
if (count($myrows) > 0){
    echo '    <section>', "\n";
    echo '      <h1>My Games</h2>', "\n";
    $rowcounter = 0;
    $hidestring = '';
    foreach ($myrows as $row){
        $expstring = $row['expansion'] == 'morrslieb' ? ' (The Horned Rat)' : '';
        echo '        <p', $hidestring, '><a href="gameboard.php?game=',
             $row['game'], '">', 'Game ', $row['game'], '</a>', $expstring,
             ': last modified ', $row['modified'], '</p>', "\n";
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
      <h1>Recent Activity</h2>
<?php
//See if the "recent" section should be expanded
$rowcounter = 0;
$hidestring = '';
//List all recent games
foreach ($allrows as $row){
    $expstring = $row['expansion'] == 'morrslieb' ? ' (The Horned Rat)' : '';
    echo '        <p', $hidestring, '><a href="gameboard.php?game=', $row['game'],
        '">','Game ', $row['game'], '</a>', $expstring, ': last modified by ',
        $row['creator'], ', ', $row['modified'], '</p>', "\n";
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
