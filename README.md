Chaos in the Old World Board Manager
====================================

This is a web application for the manipulation and display of board states for
[Chaos in the Old World][citow], a fabulous strategy game from 
[Fantasy Flight Games][ffg]. The app can be accessed [here][an_citow].

The board manager is written in PHP and Javascript, and takes advantage of a
few HTML5 technologies, most notably the `<canvas>` element.

Files
-----

+ **gameboard.php** - The page on which the application runs.
+ **gameboard.js** - The Javascript that powers the page.  (This file is _way_
  too big; I hope to break it up soon.)
+ **citow_draw.js** - Most of the `<canvas>` drawing code lives here.
+ **gamelist.php** - Create/update a couple different save game indices.
+ **savepng.php** - Send the canvas image data to the server, to be saved in PNG format.
+ **getmap.php** - Retrieve the png map from the server.
+ **savexml.php** - Send the board data to the server, to be saved as XML.
+ **index.php** - The index page for accessing existing games or staring a new one.
+ **newgame.php** - The script called by index.php to take the provided parameters
  and create a new XML game file.
+ **chaos.css** - CSS for gameboard.php and index.php.
+ **/gamedata/** - Static XML game data lives here.
+ **/icons/** - PNG game assets live here.

[citow]: http://www.fantasyflightgames.com/edge_minisite.asp?eidm=84 "Chaos in the Old World - Fantasy Flight Games"
[ffg]: http://www.fantasyflightgames.com/index.asp "Fantasy Flight Games"
[an_citow]: http://appliednerditry.com/chaos

