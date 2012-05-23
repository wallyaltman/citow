/* http://appliednerditry.com/chaos/gameboard.js
 * Created 8 Nov 2010
 * These scripts draw map components for Chaos in the Old World.
 */

/*** need to rewrite getGames, getStates, nextState ***/
var saveDirectory = "saves/";

/* Read in the list of gamestates for
 * the currently selected game.
 */
function getStates(evt, game, state){
    //File location
    var file = "save_manifest.json";
    var board = $("#board")[0];
    var localObj = board.json;
    //Set the function to do the dirty work
    //once the data (local or served) is in
    var responseFunction = function(jsonResponse, obj){
        var gamesObject;
        //Read the game list
        gamesObject = jsonResponse || obj;
        board.json = gamesObject;
        var $statePick = $("#statepick");
        //Identify the desired game
        var selectedStates = gamesObject[+game];
        //Reset the select options
        $statePick.children().remove();
        var opt, currState;
        //If no state was specified, then set
        //the last state to be selected
        optState = state ? state : selectedStates[selectedStates.length - 1];
        //Create a select option for each state
        for (var i = 0; i < selectedStates.length; i++){
            opt = document.createElement('option');
            currState = String(selectedStates[i]);
            while (currState.length < 2){
                currState = "0" + currState;
            }
            opt.text = "State " + +currState;
            opt.id = "state" + currState;
            opt.value = currState;
            if (+currState == optState){
                opt.selected = true;
            }
            $statePick.append(opt);
        }
    };
    //If no game was specified, read the gamePick
    //select element to get one
    if (!game){
        var gamePick = $("#gamepick")[0];
        game = gamePick[gamePick.selectedIndex].value;
    }
    if (localObj){
        responseFunction(null, localObj);
    }
    else {
        $.getJSON(saveDirectory + file, responseFunction);
    }
}

/* Get the next available state number
 * for saving the current game.
 */
function nextState(game, callBackFunc, passAlong){
    var xmlhttp = xmlRequest();
    //File location
    var file = "save_manifest.json";
    var board = $("#board")[0];
    var localObj = board.json;
    //Set the function to do the dirty work
    //once the data (local or served) is in
    var responseFunction = function(jsonResponse, obj){
        var gamesObject;
        //Read the game list
        gamesObject = obj || JSON.parse(jsonResponse);
        board.json = gamesObject;
        //Identify the desired game
        var selectedStates = gamesObject[+game];
        //Sort the result in reverse order
        selectedStates.sort(function(a, b){ return (b - a); });
        //Return the next state, if states exist
        if (selectedStates.length > 0){
            var returnValue = String(+selectedStates[0] + 1);
            while (returnValue.length < 2){
                returnValue = "0" + returnValue;
            }
            if (callBackFunc){
                return callBackFunc(game, returnValue, passAlong);
            }
            else {
                return returnValue;
            }
        }
    };
    if (game){
        if (localObj){
            responseFunction(null, localObj);
        }
        else if (xmlhttp) {
            xmlhttp.onreadystatechange = function(){
                if (this.readyState == 4 && this.status == 200){
                    responseFunction(this.responseText, null);
                    return true;
                }
                else {
                    return false;
                }
            };
            xmlhttp.open("GET", saveDirectory + file, true);
            xmlhttp.send();
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

/* Update the list of gamestates.
 */
function updateGameStateList(game, state){
    var xmlhttp = xmlRequest();
    var board = $("#board")[0];
    //Set the function to do the dirty work,
    //including replacing the saves list
    var responseFunction = function(jsonResponse){
        var gamesObject;
        //Read the game list
        gamesObject = JSON.parse(jsonResponse);
        board.json = gamesObject;
        var $statePick = $("#statepick");
        //Identify the desired game
        var selectedStates = gamesObject[game];
        //Reset the select options
        $statePick.children().remove();
        var opt;
        //If no state was specified, then set
        //the last state to be selected
        optState = state ? state : selectedStates[selectedStates.length - 1];
        //Create a select option for each state
        for (var i = 0; i < selectedStates.length; i++){
            opt = document.createElement('option');
            currState = String(selectedStates[i]);
            while (currState.length < 2){
                currState = "0" + currState;
            }
            opt.text = "State " + +currState;
            opt.id = "state" + currState;
            opt.value = currState;
            if (+currState == optState){
                opt.selected = true;
            }
            $statePick.append(opt);
        }
        //Update the save buttons
        updateSaveButtons();
        return true;
    };
    //If no game was specified, read the gamePick
    //select element to get one
    if (!game){
        var gamePick = $("#gamepick")[0];
        game = gamePick[gamePick.selectedIndex].value;
    }
    if (xmlhttp) {
        xmlhttp.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200){
                responseFunction(this.responseText);
            }
            else {
                return false;
            }
        };
        xmlhttp.open("GET", "gamelist.php", true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send();
    }
    else {
        return false;
    }
}

/* Update the "Save as Game" and "Overwrite Game" buttons.
 */
function updateSaveButtons(game, state){
    var board = $("#board")[0];
    if (!game){
        game = board.game;
    }
    if (!state){
        state = board.state;
    }
    //Make a callback function to do the work
    var buttonUpdate = function(game, stateNumNext, stateNum){
        var board = $("#board")[0];
        var $saveXMLButton = $("#savexmlstate");
        var $overwriteXMLstate = $("#overwritestate");
        $saveXMLButton.val("Save as Game " + +game + ", State " + +stateNumNext);
        $overwriteXMLstate.val("Overwrite Game " + +game + ", State " + +state);
        //Check for username matching the board's
        //creator, or a user with top-level permissions
        var userLevel = $("#userlevel").val();
        var userElement = $("#username")[0];
        var fail;
        if (userElement){
            var userName = userElement.firstChild.data;
        }
        else {
            fail = true;
        }
        if (userLevel < 3 && !fail){
            if (board.creator.toLowerCase() != userName.toLowerCase()){
                fail = true;
            }
        }
        //Enable the "Save as Game..." button for
        //an appropriate user
        if (!fail){
            $saveXMLButton.prop("disabled", false);
            $overwriteXMLstate.prop("disabled", false);
        }
        else {
            $saveXMLButton.prop("disabled", true);
            $overwriteXMLstate.prop("disabled", true);
        }
    };
    //Fill in the game and state number
    nextState(game, buttonUpdate, state);
}

/* Read in a saved XML board state file.
 * TODO: Make this function asynchronous
 */
function getBoardState(blank, expansion){
    var xmlhttp = xmlRequest();
    var gamePick = document.getElementById("gamepick");
    var game = gamePick.options[gamePick.selectedIndex].value;
    var statePick = document.getElementById("statepick");
    var state = statePick.options[statePick.selectedIndex].value;
    var board = document.getElementById("board");
    var loc, file, url;
    //Get the board state document
    //If getting a clean board, check whether an
    //expansion board was requested
    if (blank){
        loc = "gamedata/";
        file = (expansion == "morrslieb") ? "blankboard_hr.xml" : "blankboard.xml";
        url = loc + file;
    }
    else {
        loc = saveDirectory;
        url = loc + "game" + game + "state" + state + ".xml";
    }
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    var xmlDoc = xmlhttp.responseXML;
    board.game = Number(game);
    board.state = Number(state);
    //Read the board's creator from the XML
    var root = xmlDoc.documentElement;
    board.creator = root.getAttribute("creator");
    //Update the save buttons
    if (!blank){
        updateSaveButtons();
    }
    else {
        var saveXMLButton = document.getElementById("savexmlstate");
        var overwriteXMLstate = document.getElementById("overwritestate");
        //Disable the "Save as Game..."
        //and "Overwrite" buttons
        saveXMLButton.value = "Save as";
        overwriteXMLstate.value = "Overwrite";
        saveXMLButton.disabled = true;
        overwriteXMLstate.disabled = true;
    }
    return xmlDoc;
}

/* Read in the XML game setup file.
 */
function getGameSetup(expansion){
    var xmlhttp = xmlRequest();
    //Get the board setup document
    var loc = "gamedata/";
    var url = expansion == "morrslieb" ? loc + "board_hr.xml" : loc + "board.xml";
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    var xmlDoc = xmlhttp.responseXML;
    return xmlDoc;
}

/* Set up a toggle switch for the
 * targeted object.
 */
function createToggleSwitch(target, display, displayArg, property, invert){
    var select = document.createElement("img");
    select.src = "../chaos/icons/select.png";
    select.className = "toggle";
    select.height = 15;
    select.width = 15;
    var unselect = document.createElement("img");
    unselect.src = "../chaos/icons/unselect.png";
    unselect.className = "toggle";
    unselect.height = 15;
    unselect.width = 15;
    var toggle = document.createElement("div");
    toggle.className = "togglebox";
    toggle.select = select;
    toggle.unselect = unselect;
    toggle.target = target;
    toggle.display = display;
    toggle.displayArg = displayArg;
    toggle.property = property || "active";
    toggle.invert = invert;
    var state = invert ? !target[toggle.property] : target[toggle.property];
    //Set the initial state
    if (state){
        toggle.appendChild(select);
    }
    else {
        toggle.appendChild(unselect);
    }
    //Set methods
    toggle.on = function(){
        var node = this.firstElementChild;
        this.replaceChild(this.select, node);
    };
    toggle.off = function(){
        var node = this.firstElementChild;
        this.replaceChild(this.unselect, node);
    };
    toggle.check = function(){
        var state = this.invert ? !this.target[this.property] : this.target[this.property];
        if (state){
            this.on();
        }
        else {
            this.off();
        }
    };
    //Set the handler
    toggle.flip = function(){
        if (this.target){
            this.target[this.property] = !this.target[this.property];
            this.check();
            if (this.display){
                if (this.displayArg){
                    this.display.draw(this.displayArg);
                }
                else {
                    this.display.draw();
                }
                unsavedBoard();
            }
        }
        return false;
    };
    toggle.onmousedown = toggle.flip;
    return toggle;
}

/* Create up/down input arrows.
 */
function createUpDownButtons(target){
    var player = target.owner;
    var div = document.createElement("div");
    div.className = "updown";
    div.target = target;
    //Create the image elements
    var up = document.createElement("img");
    up.style.backgroundColor = player.highlight;
    up.srcData = {
        base : "../chaos/icons/up.png",
        hover : "../chaos/icons/up_hover.png",
        press : "../chaos/icons/up_press.png"
    };
    up.src = up.srcData.base;
    up.target = target;
    div.up = up;
    var down = document.createElement("img");
    down.style.backgroundColor = player.highlight;
    down.srcData = {
        base : "../chaos/icons/down.png",
        hover : "../chaos/icons/down_hover.png",
        press : "../chaos/chaos/icons/down_press.png"
    };
    down.src = down.srcData.base;
    down.target = target;
    div.down = down;
    //Set mouse handlers on the images
    up.onmouseover = function(){
        this.src = this.srcData.hover;
    };
    up.onmouseout = function(){
        this.src = this.srcData.base;
        clearInterval(this.interval);
        clearTimeout(this.timer);
        return false;
    };
    up.onmousedown = function(){
        this.src = this.srcData.press;
        if (this.target.max != this.target.value){
            this.target.value = Number(this.target.value) + 1;
            //Flag the board as unsaved
            unsavedBoard();
        }
        this.target.draw();
        //Repeat the increment on a
        //press and hold
        var button = this;
        button.timer = setTimeout(function(){
            clearInterval(button.interval);
            button.interval = setInterval(function(){
                if (button.target.max != button.target.value){
                    button.target.value = Number(button.target.value) + 1;
                    button.target.draw();
                }
            }, 60);
        }, 300);
        return false;
    };
    up.onmouseup = function(){
        this.src = this.srcData.hover;
        clearInterval(this.interval);
        clearTimeout(this.timer);
    };
    down.onmouseover = function(){
        this.src = this.srcData.hover;
    };
    down.onmouseout = function(){
        this.src = this.srcData.base;
        clearInterval(this.interval);
        clearTimeout(this.timer);
        return false;
    };
    down.onmousedown = function(){
        this.src = this.srcData.press;
        if (this.target.min != this.target.value){
            this.target.value = Number(this.target.value) - 1;
            //Flag the board as unsaved
            unsavedBoard();
        }
        this.target.draw();
        //Repeat the decrement on a
        //press and hold
        var button = this;
        button.timer = setTimeout(function(){
            clearInterval(button.interval);
            button.interval = setInterval(function(){
                if (button.target.min != button.target.value){
                    button.target.value = Number(button.target.value) - 1;
                    button.target.draw();
                }
            }, 60);
        }, 300);
        return false;
    };
    down.onmouseup = function(){
        this.src = this.srcData.hover;
        clearInterval(this.interval);
        clearTimeout(this.timer);
    };
    //Set handlers on the div
    div.onmousedown = function(){ return false; };
    var stepMethod = function(amount){
        this.target.value = Number(this.target.value) + amount;
        if (Number(this.target.value) > Number(this.target.max)){
            this.target.value = this.target.max;
        }
        else if (Number(this.target.value) < Number(this.target.min)){
            this.target.value = this.target.min;
        }
        else {
            unsavedBoard();
        }
        this.target.draw();
    };
    //Enable mousewheel support
    addMouseWheelListener(div, stepMethod);
    //Insert the base buttons
    div.appendChild(up);
    div.appendChild(down);
    return div;
}

/* Generate the list of Old World cards.
 */
function getOldWorldCards(cardSet){
    var loc = "gamedata/";
    var url;
    switch (cardSet) {
        case "all":
            url = loc + "oldworld_all.xml";
            break;
        case "morrslieb":
            url = loc + "oldworld_hard.xml";
            break;
        default:
            url = loc + "oldworld.xml";
    }
    $.get(url, function(xmlDoc) {
        var $xmlDoc = $(xmlDoc);
        var $board = $("#board");
        var board = $board[0];

        console.log("Setting OWC listener for 'scoreboardLoaded'");
        $board.on("scoreboardLoaded", function () {
            var players = board.map.players;
            var $oldWorldCardXMLArray = $xmlDoc.find("card");
            //var oldWorldCards = xmlDoc.getElementsByTagName("card");
            var $owc = $("#owc");
            $owc.children().remove();

            $oldWorldCardXMLArray.each(function () {
                var $cardXML = $(this);
                var card = new OldWorldCard($cardXML);
                card.active = true;

                //If the Horned Rat is a player, make The Horned One's Due
                //an event card
                if (card.dataid === "owc011" && board.allPlayers["Horned_Rat"]) {
                    card.event = true;
                }

                card.createCanvas();
                $owc.append(card.canvas);
                card.draw(1, 0, card.canvasCtx);
            });
        });
    });
}

/* Generate the list of Chaos cards.
 */
function getChaosCards(expansion){
    var loc = "gamedata/";
    var url = loc + ((expansion == "morrslieb") ? "chaos_hr.xml" : "chaos.xml");
    $.get(url, function(xmlDoc) {
        var $xmlDoc = $(xmlDoc);
        var $board = $("#board");
        var board = $board[0];
        var i, j, $cc0, $cc1;
        var chaosCards = xmlDoc.getElementsByTagName("card");
        var $chaosCardXMLArray = $xmlDoc.find("card");
        console.log("Setting CC listener for 'scoreboardLoaded'");
        $board.on("scoreboardLoaded", function () {
            var players = board.map.players;
            var cardSets = [];
            var $cardSets;
            var setLengths;
            var columns;
            var currentCol;
            $cc0 = $("#cc0");
            $cc0.children().remove();
            $cc1 = $("#cc1");
            $cc1.children().remove();

            $(board.plugins._list).each(function () {
                if (this.chaoscardsXML) {
                    $chaosCardXMLArray = $chaosCardXMLArray.add($(this.chaoscardsXML).find("card"));
                }
            });

            $chaosCardXMLArray.each(function () {
                var card = new ChaosCard($(this)),
                    currentId;

                //Check the player list for the card's owner, and
                //link them.  Skip the rest if the card's owner
                //isn't a player in the game (or the Old World).
                if (!card.owner) {
                    card.owner = {
                        name      : "Old_World",
                        idNum     : board.maxPowers,
                        highlight : "#CCA477",
                        shadow    : "#3D3322"
                    }
                } else {
                    card.createCanvas();

                    currentId = card.owner.idNum;
                    // Add the card's canvas to the appropriate
                    // card set, creating it if needed
                    if (!cardSets[currentId]) {
                        cardSets[currentId] = [];
                    }
                    cardSets[currentId].push(card);
                }
            });
            $cardSets = $(cardSets);

            console.log("Loading card drawer");
            // Determine a suitable distribution of card sets between the
            // columns, so that column 1 will have the most cards.
            setLengths = [];
            $cardSets.each(function () {
                setLengths.push(this.length);
            });

            // Sort in descending order, and assign columns
            setLengths.sort(function (a, b) { return b - a });
            columns = [ [], [] ];
            currentCol = 0;
            $(setLengths).each(function () {
                var match,
                    currentLength = this.valueOf();

                for (var i = 0; i < cardSets.length; i++) {
                    if (cardSets[i].length === currentLength) {
                        match = cardSets.splice(i, 1)[0];
                        break;
                    }

                }

                // If we somehow failed to find a match, take the first cardset
                if (!match) {
                    match = cardSets.splice(0, 1)[0];
                }

                columns[currentCol] = columns[currentCol].concat(match);

                // Alternate columns
                currentCol = (currentCol + 1) % 2;
            });
            // Define a card comparison function for use in sorting the columns
            var compareCards = function(a, b) {
                var id_a, id_b, name_a, name_b;
                // 1. Compare owner IDs
                id_a = a.owner.idNum;
                id_b = b.owner.idNum;
                if (id_a !== id_b) {
                    return id_a - id_b;
                }

                // 2. Compare card costs (NaN goes last)
                if (a.cost !== b.cost) {
                    if (isNaN(b.cost)) {
                        return -1;
                    } else if (isNaN(a.cost)) {
                        return 1;
                    } else {
                        return a.cost - b.cost;
                    }
                }

                // 3. Compare "normalized" card names
                name_a = a.normalizedName;
                name_b = b.normalizedName;
                if (name_a !== name_b) {
                    if (!name_b.substr(0, 1).match(/[A-Za-z0-9]/)) {
                        return -1;          // Non-alphanumeric is "biggest"
                    }
                    else if (!name_a.substr(0, 1).match(/[A-Za-z0-9]/)) {
                        return 1;
                    }
                    else if (name_a < name_b) {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                }
                // 4. Give up
                return 0;
            };

            // Sort each column
            columns[0].sort(compareCards);
            columns[1].sort(compareCards);

            // Stuff the cards into their containers and draw them
            $(columns[0]).each(function() {
                $cc0.append(this.canvas);
                this.draw(1, 0, this.canvasCtx);
            });
            $(columns[1]).each(function() {
                $cc1.append(this.canvas);
                this.draw(1, 0, this.canvasCtx);
            });

            // Shift column 0 (which appears second in the markup)
            // upwards to line up with column 1
            $cc0.css({
                marginTop: -1 * $cc1.height() - 4
            });
        });
    });
}

/* Set up the Old World token pool.
 */
function buildTokenPool(){
    var board = document.getElementById("board");
    var pools = board.map.tokenPool._list,
        $pools = $(pools);
    var canvas = document.getElementById("pool");
    var ctx = canvas.getContext('2d');
    canvas.pools = pools;
    var x0 = 3;
    var i, j, y0, y1;
    $pools.each(function (index, pool) {
        y0 = y1 || 3;
        y1 = y0 + 25 * pool.rows();
        pool.ctx = ctx;
        pool.x0 = x0;
        pool.x1 = 175;
        pool.y0 = y0;
        pool.y1 = y1;
        pool.draw = drawOldWorldTokens;
        pool.drag = dragObject;
        pool.drop = dropObject;
        //console.log("Drawing " + pool.name + " pool");
    });
    // Resize the canvas, then draw the pools
    canvas.height = y1 + 22;
    $pools.each(function (index, pool) {
        pool.draw();
    });

    canvas.cursorPos = getCursorPosition;
    var pen = document.getElementById("pen");
    var parentDiv = canvas.parentNode;
    var styles = getComputedStyle(parentDiv, null) || parentDiv.currentStyle;
    var topPad = Number(styles.paddingTop.replace(/[^0-9]/g,""));
    //Create the mousedown handler
    canvas.press = function(evt){
        //Check to be sure no object is held
        if (!pen.held){
            var i;
            var coord = this.cursorPos(evt);
            var x = coord.x;
            var y = coord.y + topPad;
            //Check for an object source
            //area under the cursor
            var areas = this.pools;
            for (i = 0; i < areas.length; i++){
                if (areas[i].x0 <= x && x < areas[i].x1 && areas[i].y0 <= y && y < areas[i].y1){
                    areas[i].drag(evt, x, y);
                    break;
                }
            }
        }
        var board = document.getElementById("board");
        document.onmouseup = function(evt){
            board.release(evt);
        };
        return false;
    };
    canvas.onmousedown = canvas.press;
}

/* Update the scoreboard values based
 * on the control panel.
 */
function updateScoreBoard(){
    var board = document.getElementById("board");
    var score = board.map.score;
    var players = score.players;
    var rows = document.getElementById("scorebody").rows;
    var playerName = this.id.match(/\w+(?=_)/)[0];
    var target = this.id.replace(/\w+_/,'');
    target = (target == "dial") ? "dialValue" : target;
    var i;
    for (i = 0; i < players.length; i++){
        if (playerName == players[i].name){
            var currentPlayer = players[i];
            break;
        }
    }
    if (!this.value || isNaN(this.value)){
        this.value = 0;
    }
    //Use special handling for peasants
    if (target == "peasants"){
        var diff = this.value - currentPlayer.peasants.length;
        var pen = document.getElementById("pen");
        var peasantPool = board.map.tokenPool.peasant.tokens;
        var token;
        //If peasants were lost, return them
        //to the pool
        if (diff < 0){
            for (i = 0; i < -1 * diff; i++){
                if (!pen.held){
                    token = currentPlayer.peasants.pop();
                    pen.held = token;
                    token.home.drop();
                    token.home.draw();
                }
            }
        }
        //If peasants were gained, take
        //them from the pool
        else if (diff > 0){
            for (i = 0; i < diff; i++){
                if (peasantPool.length > 0){
                    token = peasantPool.pop();
                    currentPlayer.peasants.push(token);
                    token.home.draw();
                }
                else {
                    break;
                }
            }
        }
        if (diff != 0){
            //Reset the control field, in case the
            //wrong number of peasants was moved
            this.value = currentPlayer.peasants.length;
            //Calculate remaining peasant tokens and
            //set maximum values accordingly
            var remaining = peasantPool.length;
            var scorePeasants;
            for (i = 0; i < rows.length; i++){
                scorePeasants = rows[i].cells[1].firstElementChild;
                scorePeasants.max = Number(scorePeasants.value) + remaining;
            }
            //Flag the board as unsaved
            unsavedBoard();
        }
    }
    //Handle other items
    else {
        if (currentPlayer[target] != this.value){
            currentPlayer[target] = this.value
            //Flag the board as unsaved
            unsavedBoard();
        }
    }
    //Redraw the scoreboard
    score.draw();
}

/* Create the control panel for
 * the scoreboard.
 */
function buildScoreBoardControls(){
    var board = document.getElementById("board");
    var score = board.map.score;
    var players = score.players;
    var compat = checkCompatibility();
    var row, cell, nameCell, peasantCell, upgradeRow, upgradeCell, ppCell, vpCell, dialCell, dacCell;
    var upgrades, nameCell2, upgradeName, upgradeCheck, upgradeSwitch, upgradeSwitchText;
    var i, j, text, name, peasants, pp, vp, dial, dacs;
    //Check for support of the "number"
    //input type
    var numType = (compat.inputNumber) ? "number" : "text";
    //Create a value-incrementing method for
    //use with mousewheel events if the
    //"number" type isn't supported
    var addValue = function(amount){
        var newAmount = Number(this.value) + amount;
        newAmount = (newAmount > this.max) ? this.max : newAmount;
        newAmount = (newAmount < this.min) ? this.min : newAmount;
        this.value = newAmount;
        this.update();
        return false;
    };
    /*** Upgrade controls ***/
    //Clean up any old stuff
    var upgradeControl = document.getElementById("upgradecontrol");
    var upgradeHead = document.getElementById("upgradehead");
    while (upgradeHead.childNodes.length > 0){
        upgradeHead.removeChild(upgradeHead.firstChild);
    }
    var upgradeBody = document.getElementById("upgradebody");
    while (upgradeBody.childNodes.length > 0){
        upgradeBody.removeChild(upgradeBody.firstChild);
    }
    //Make the header row
    upgradeRow = document.createElement("tr");
    cell = document.createElement("th");
    cell.colSpan = "6";
    text = document.createTextNode("Upgrades");
    cell.appendChild(text);
    upgradeRow.appendChild(cell);
    upgradeHead.appendChild(upgradeRow);
    /*** Other score controls ***/
    //Clean up any old stuff
    var scoreControl = document.getElementById("scorecontrol");
    var scoreHead = document.getElementById("scorehead");
    while (scoreHead.childNodes.length > 0){
        scoreHead.removeChild(scoreHead.firstChild);
    }
    var scoreBody = document.getElementById("scorebody");
    while (scoreBody.childNodes.length > 0){
        scoreBody.removeChild(scoreBody.firstChild);
    }
    //Make the header row
    var headers = ["", "Peasants", "PP", "VP", "Dial", "DACs"];
    row = document.createElement("tr");
    for (i = 0; i < headers.length; i++){
        cell = document.createElement("th");
        text = document.createTextNode(headers[i]);
        cell.appendChild(text);
        row.appendChild(cell);
    }
    scoreHead.appendChild(row);
    /*** Additional PP controls ***/
    var ppBox = document.getElementById("ppbox");
    var inputBox = document.getElementById("inputbox");
    //Clean up any old stuff
    while (inputBox.childElementCount > 1){
        inputBox.removeChild(inputBox.lastElementChild);
    }
    /*** PP and DACs reset buttons ***/
    var resetPP = document.getElementById("resetpp");
    var resetDACs = document.getElementById("resetdacs");
    //Set up the reset buttons and arming toggles
    var buttonPP = document.createElement("input");
    buttonPP.type = "button";
    buttonPP.className = "right";
    buttonPP.disabled = "disabled";
    buttonPP.value = "Go!";
    var togglePP = createToggleSwitch(buttonPP, null, null, "disabled", true);
    togglePP.className += " right";
    resetPP.appendChild(buttonPP);
    resetPP.appendChild(togglePP);
    buttonPP.onclick = function(){
        var i, j, maxPP, inputPP;
        for (i = 0; i < players.length; i++){
            maxPP = Number(board.info.getElementsByTagName("power")[i].getElementsByTagName("pp")[0].firstChild.data);
            for (j = 0; j < players[i].upgrades.length; j++){
                maxPP += players[i].upgrades[j].active ? players[i].upgrades[j].pp : 0;
            }
            inputPP = document.getElementById(players[i].name + "_pp");
            inputPP.value = maxPP;
            inputPP.update();
        }
        togglePP.flip();
    };
    var buttonDACs = document.createElement("input");
    buttonDACs.type = "button";
    buttonDACs.className = "right";
    buttonDACs.disabled = "disabled";
    buttonDACs.value = "Go!";
    var toggleDACs = createToggleSwitch(buttonDACs, null, null, "disabled", true);
    toggleDACs.className += " right";
    resetDACs.appendChild(buttonDACs);
    resetDACs.appendChild(toggleDACs);
    buttonDACs.onclick = function(){
        var i, j, inputDACs;
        for (i = 0; i < players.length; i++){
            inputDACs = document.getElementById(players[i].name + "_dacs");
            inputDACs.value = 0;
            inputDACs.update();
        }
        toggleDACs.flip();
    };
    /*** Player Rows ***/
    var playerName, inputUpDown;
    for (i = 0; i < players.length; i++){
        row = document.createElement("tr");
        row.style.color = players[i].highlight;
        row.style.backgroundColor = players[i].shadow;
        upgradeRow = document.createElement("tr");
        upgradeRow.style.color = players[i].highlight;
        upgradeRow.style.backgroundColor = players[i].shadow;
        //Name (in both tables)
        playerName = players[i].name;
        name = document.createTextNode(players[i].displayName);
        nameCell = document.createElement("td");
        nameCell.appendChild(name);
        row.appendChild(nameCell);
        nameCell2 = nameCell.cloneNode(true);
        upgradeRow.appendChild(nameCell2);
        //Peasants
        peasants = document.createElement("input");
        peasants.update = updateScoreBoard;
        peasants.addEventListener('input',peasants.update,false);
        peasants.onpropertychange = function(evt){
            var e = evt || window.event;
            if (e.propertyName.toLowerCase() == "value"){
                this.update();
            }
        };
        peasants.id = playerName + "_peasants";
        peasants.type = numType;
        peasants.className = "score wide";
        peasants.min = "0";
        peasants.value = players[i].peasants.length;
        peasantCell = document.createElement("td");
        peasantCell.className = "centered";
        peasantCell.appendChild(peasants);
        row.appendChild(peasantCell);
        //Upgrades (in a separate table)
        upgrades = players[i].upgrades;
        for (j = 0; j < upgrades.length; j++){
            upgradeCheck = createToggleSwitch(upgrades[j], score);
            upgradeCheck.id = playerName + "_upgrade" + j;
            /* upgradeSwitch = document.createElement("div");
            upgradeSwitch.className = "switch";
            upgradeSwitch.appendChild(upgradeCheck); */
            upgradeName = document.createTextNode(upgrades[j].name);
            upgradeSwitchText = document.createElement("span");
            upgradeSwitchText.className = "switchtext";
            upgradeSwitchText.appendChild(upgradeName);
            upgradeCell = document.createElement("td");
            /* upgradeCell.appendChild(upgradeSwitch); */
            upgradeCell.appendChild(upgradeCheck);
            upgradeCell.appendChild(upgradeSwitchText);
            upgradeRow.appendChild(upgradeCell);
        }
        //PP
        pp = document.createElement("input");
        pp.update = updateScoreBoard;
        pp.owner = players[i];   //For use by the createUpDownButtons function
        pp.draw = pp.update;
        pp.addEventListener('input',peasants.update,false);
        pp.onpropertychange = function(evt){
            var e = evt || window.event;
            if (e.propertyName.toLowerCase() == "value"){
                this.update();
            }
        };
        pp.id = playerName + "_pp";
        pp.type = numType;
        pp.className = "score pp"
        pp.min = "0";
        pp.max = "30";
        pp.value = players[i].pp;
        ppCell = document.createElement("td");
        ppCell.className = "centered";
        ppCell.appendChild(pp);
        row.appendChild(ppCell);
        inputUpDown = createUpDownButtons(pp);
        inputBox.appendChild(inputUpDown);
        //VP
        vp = document.createElement("input");
        vp.update = updateScoreBoard;
        vp.addEventListener('input',peasants.update,false);
        vp.onpropertychange = function(evt){
            var e = evt || window.event;
            if (e.propertyName.toLowerCase() == "value"){
                this.update();
            }
        };
        vp.id = playerName + "_vp";
        vp.type = numType;
        vp.min = "0";
        vp.max = "99";
        vp.className = "score wide";
        vp.value = players[i].vp;
        vpCell = document.createElement("td");
        vpCell.className = "centered";
        vpCell.appendChild(vp);
        row.appendChild(vpCell);
        //Threat dial
        dial = document.createElement("input");
        dial.update = updateScoreBoard;
        dial.addEventListener('input',peasants.update,false);
        dial.onpropertychange = function(evt){
            var e = evt || window.event;
            if (e.propertyName.toLowerCase() == "value"){
                this.update();
            }
        };
        dial.id = playerName + "_dial";
        dial.type = numType;
        dial.className = "score"
        dial.min = "0";
        dial.max = players[i].dialCap;
        dial.value = players[i].dialValue;
        dialCell = document.createElement("td");
        dialCell.className = "centered";
        dialCell.appendChild(dial);
        row.appendChild(dialCell);
        //Dial Advancement Counters
        dacs = document.createElement("input");
        dacs.update = updateScoreBoard;
        dacs.addEventListener('input',peasants.update,false);
        dacs.onpropertychange = function(evt){
            var e = evt || window.event;
            if (e.propertyName.toLowerCase() == "value"){
                this.update();
            }
        };
        dacs.id = playerName + "_dacs";
        dacs.type = numType;
        dacs.className = "score"
        dacs.min = "0";
        dacs.max = "9";
        dacs.value = players[i].dacs;
        dacCell = document.createElement("td");
        dacCell.className = "centered";
        dacCell.appendChild(dacs);
        row.appendChild(dacCell);
        //Insert the rows into the tables
        scoreBody.appendChild(row);
        upgradeBody.appendChild(upgradeRow);
        //Set mousewheel events if needed
        if (numType != "number"){
            addMouseWheelListener(peasants, addValue);
            addMouseWheelListener(pp, addValue);
            addMouseWheelListener(vp, addValue);
            addMouseWheelListener(dial, addValue);
            addMouseWheelListener(dacs, addValue);
        }
    }
    /*** Show/hide controls ***/
    var switchDiv = document.getElementById("scoreswitch");
    switchDiv.panelId = "score";
    switchDiv.closePanels = closePanels;
    switchDiv.onmousedown = function(evt){
        var e = evt || window.event;
        var box = document.getElementById("scorebox");
        //Close the other panels
        this.closePanels();
        //Open the score panel
        toggleClass("z5", box);
        var parent = this.parentNode;
        toggleClass("stuck", parent);
        //Set an event on the document to
        //close the panel
        if (document.addEventListener){
            //Decent browsers
            document.addEventListener("mousedown", closePanels, false);
        }
        else if (document.attachEvent){
            //Internet Explorer
            document.attachEvent("onmousedown", closePanels);
        }
        //Stop event propagation
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        else {
            e.cancelBubble = true;
        }
        return false;
    };
    //Cancel event propagation on the controls
    var boxes = document.getElementsByClassName("scoresubbox");
    for (i = 0; i < boxes.length; i++){
        boxes[i].onmousedown = function(evt){
            var e = evt || window.event;
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                e.cancelBubble = true;
            }
        };
    }
}

/* Set up the workshop for configuring
 * effects and markers on figures.
 */
function buildWorkshop(){
    var workshop = document.getElementById("workshop");
    var switchList = document.getElementsByClassName("effect");
    var switchText = document.getElementsByClassName("effecttext");
    var switchData = [ ["shield", "Warp Shield"], ["musk", "Soporific Musk"], ["marker", "Upgrade Marker"] ];
    var toggle, oldNode, node, i;
    //Create toggles with null targets for
    //the empty display, and label them
    workshop.switches = [];
    for (i = 0; i < switchData.length; i++){
        toggle = createToggleSwitch('', workshop, null, switchData[i][0]);
        toggle.id = "switch_" + switchData[i][0];
        oldNode = switchList[i].firstElementChild;
        if (oldNode){
            switchList[i].replaceChild(toggle, oldNode);
        }
        else {
            switchList[i].appendChild(toggle);
        }
        node = document.createTextNode('');
        node.data = switchData[i][1];
        oldNode = switchText[i].firstChild;
        if (oldNode){
            switchText[i].replaceChild(node, oldNode);
        }
        else {
            switchText[i].appendChild(node);
        }
        workshop.switches.push(toggle);
    }
    workshop.type = "workshop";
    //Set the draw method
    workshop.draw = function(){
        var ctx = this.getContext('2d');
        //Clear the box
        ctx.clearRect(0, 0, this.width, this.height);
        //Draw the figure, if one is held
        if (this.figures[0]){
            var figure = this.figures[0];
            var figHeight = figure.y1 - figure.y0;
            var figWidth = figure.x1 - figure.x0;
            var padLeft = Math.floor((this.width - figWidth) / 2);
            var padTop = Math.floor((this.height - figHeight) / 2);
            figure.draw(padLeft, this.height - padTop, ctx);
        }
    };
    //Create the figures array if needed, and
    //empty it otherwise
    if (!workshop.figures){
        workshop.figures = [];
    }
    else {
        workshop.figures.length = 0;
        workshop.draw();
    }
    //Set the drag and drop methods
    workshop.drag = dragObject;
    workshop.drop = dropObject;
    //Set the mouseup handler, for
    //dropping figures in the shop
    workshop.cursorPos = getCursorPosition;
    workshop.release = function(evt){
        var pen = document.getElementById("pen");
        if (pen.held){
            //Drop a held figure in the shop, or
            //in its reserves if the shop is full
            if (pen.held.type == "figure"){
                if (this.figures.length == 0){
                    var coord = this.cursorPos(evt);
                    var x = coord.x;
                    var y = coord.y;
                    if (0 <= x && x < this.width && 0 <= y && y < this.height){
                        this.drop();
                        var i;
                        for (i = 0; i < this.switches.length; i++){
                            this.switches[i].target = this.figures[0];
                            this.switches[i].check();
                        }
                    }
                    else {
                        pen.held.owner.drop();
                    }
                }
                else {
                    pen.held.owner.drop();
                }
            }
        }
    };
    //Set the mousedown handler, for
    //picking up a figure
    workshop.press = function(evt){
        var pen = document.getElementById("pen");
        if (!pen.held){
            var coord = this.cursorPos(evt);
            var x = coord.x;
            var y = coord.y;
            this.drag(evt, x, y);
            var i;
            for (i = 0; i < this.switches.length; i++){
                this.switches[i].target = null;
                this.switches[i].off();
            }
        }
        document.onmouseup = function(evt){
            var board = document.getElementById("board");
            board.release(evt);
        };
        return false;
    };
    workshop.onmousedown = workshop.press;
    //Set up the show/hide controls
    var switchDiv = document.getElementById("workswitch");
    switchDiv.panelId = "work";
    switchDiv.closePanels = closePanels;
    switchDiv.onmousedown = function(evt){
        var e = evt || window.event;
        var box = document.getElementById("workbox");
        //Close the other panels
        this.closePanels();
        //Open the workshop panel
        toggleClass("z5", box);
        var parent = this.parentNode;
        toggleClass("stuck", parent);
        //Stop event propagation
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        else {
            e.cancelBubble = true;
        }
        return false;
    };
    return workshop;
}

/* Set up the controls for editing
 * corruption and ruining regions
 */
function buildCorruption(){
    var board = document.getElementById("board");
    var regions = board.map.regions;
    var players = board.map.players;
    var box = document.getElementById("corruptbox");
    var width = 240;
    var height = 110;
    var yOffset = 21;
    var i, j, x, y, subBox, div, inputBox, input, inputUpDown;
    var styles, lborder, lpadding, tborder, tpadding;
    var ruinSpan, ruinText, ruinInput;
    //Create a div for each region
    for (i = 0; i < regions.length; i++){
        //Set the position in the bottom portion
        //of the region, where figures are
        x = 10 + (regions[i].border.col * (width + 10));
        y = 10 + (regions[i].border.row * (height + 10)) + yOffset;
        //Set up a frame
        subBox = document.createElement("div");
        subBox.className = "corrupt";
        subBox.style.position = "absolute";
        subBox.style.left = x + "px";
        subBox.style.top = y + "px";
        //Set width for the inner div
        div = document.createElement("div");
        div.className = "corruptinner";
        div.style.width = String(width - 12) + "px";
        //Set up the corruption input buttons
        inputBox = document.createElement("div");
        inputBox.className = "right";
        inputBox.onmousedown = function(){ return false; };
        for (j = 0; j < regions[i].corruption.length; j++){
            inputUpDown = createUpDownButtons(regions[i].corruption[j]);
            inputBox.appendChild(inputUpDown);
        }
        //Set up the ruin input box
        ruinSpan = document.createElement("span");
        ruinSpan.className = "ruined emphasis";
        ruinText = document.createTextNode("Ruined: ");
        ruinSpan.appendChild(ruinText);
        ruinInput = document.createElement("input");
        ruinInput.className = "ruin";
        ruinInput.size = 1;
        ruinInput.value = regions[i].ruined;
        ruinInput.region = regions[i];
        ruinInput.update = function(){
            var value = Number(this.value);
            if (value >= 0 && value < 10){
                if (this.region.ruined != value){
                    this.region.ruined = value;
                    //Flag the board as unsaved
                    unsavedBoard();
                }
                this.region.draw();
            }
            else {
                this.value = this.region.ruined;
            }
        };
        //Set the ruin event listener
        ruinInput.addEventListener('input', ruinInput.update, false);
        ruinInput.onpropertychange = function(evt){
            var e = evt || window.event;
            if (e.propertyName.toLowerCase() == "value"){
                this.update();
            }
        };
        //Insert the content
        div.appendChild(inputBox);
        div.appendChild(ruinSpan);
        div.appendChild(ruinInput);
        subBox.appendChild(div);
        box.appendChild(subBox);
    }
    /*Set up the toggle to move the corruption controls*/
    shiftBox = document.createElement("div");
    shiftBox.className = "shiftbox";
    corruptUp = document.createElement("img");
    corruptUp.src = "../chaos/icons/corrupt_up.png";
    corruptUp.height = 17;
    corruptUp.width = 24;
    corruptUp.className = "white";
    corruptDown = document.createElement("img");
    corruptDown.src = "../chaos/icons/corrupt_down.png";
    corruptDown.height = 17;
    corruptDown.width = 24;
    corruptDown.className = "gray";
    swap = document.createElement("img");
    swap.src = "../chaos/icons/swap.png";
    swap.height = 17;
    swap.width = 13;
    swap.className = "black";
    //Set methods
    shiftBox.moveDown = function(){
        toggleClass("shift", box, "on");
        corruptUp.className = "gray";
        corruptDown.className = "white";
        this.onclick = this.moveUp;
        return false;
    };
    shiftBox.moveUp = function(){
        toggleClass("shift", box, "off");
        corruptUp.className = "white";
        corruptDown.className = "gray";
        this.onclick = this.moveDown;
        return false;
    };
    shiftBox.onclick = shiftBox.moveDown;
    shiftBox.onmousedown = function(evt){
        var e = evt || window.event;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        else {
            e.cancelBubble = true;
        }
    };
    shiftBox.onmouseover = function(){
        swap.className = "white";
    };
    shiftBox.onmouseout = function(){
        swap.className = "black";
    };
    shiftBox.appendChild(corruptUp);
    shiftBox.appendChild(swap);
    shiftBox.appendChild(corruptDown);
    box.appendChild(shiftBox);
    /*Set up the show/hide controls*/
    var switchDiv = document.getElementById("corruptswitch");
    switchDiv.panelId = "corrupt";
    switchDiv.closePanels = closePanels;
    switchDiv.onmousedown = function(evt){
        var e = evt || window.event;
        var box = document.getElementById("corruptbox");
        //Close the other panels
        this.closePanels();
        //Open the corruption panel
        toggleClass("z5", box);
        var parent = this.parentNode;
        toggleClass("stuck", parent);
        //Set an event on the document to
        //close the panel
        if (document.addEventListener){
            //Decent browsers
            document.addEventListener("mousedown", closePanels, false);
        }
        else if (document.attachEvent){
            //Internet Explorer
            document.attachEvent("onmousedown", closePanels);
        }
        //Stop event propagation
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        else {
            e.cancelBubble = true;
        }
        return false;
    };
    //Cancel event propagation on the controls
    var boxes = document.getElementsByClassName("corrupt");
    for (i = 0; i < boxes.length; i++){
        boxes[i].onmousedown = function(evt){
            var e = evt || window.event;
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                e.cancelBubble = true;
            }
        };
    }
}

/* Close one or more of the control panels.
 */
function closePanels(evt){
    var e = evt || window.event;
    var panelList = ["corrupt", "score", "work"];
    //Hold open the invoking panel, if there is one
    var index = panelList.indexOf(this.panelId);
    if (index >= 0){
        panelList.remove(index);
    }
    //Close the listed panels
    var panel, panelParent;
    for (var i = 0; i < panelList.length; i++){
        panel = document.getElementById(panelList[i] + "box");
        toggleClass("z5", panel, "off");
        panelParent = document.getElementById(panelList[i] + "handle");
        toggleClass("stuck", panelParent, "off");
    }
    //Unregister the mousedown event on
    //the document
    if (document.removeEventListener){
        //Decent browsers
        document.removeEventListener("mousedown", closePanels, false);
    }
    else if (document.detachEvent){
        //Internet Explorer
        document.detachEvent("onmousedown", closePanels);
    }
}

/**
 * Clear effect markers from all figures, and
 * redraw all regions.
 */
function clearEffects(){
    var $board = $("#board");
    var regions = $board[0].map.regions;
    $.each(regions, function(ind, region){
        $.each(region.figures, function(indF, figure){
            figure.clearAll();
        });
        region.draw();
    });
}

var Icons = (function () {
    var setups = [
        {
            name : "dac",
            width : 19,
            height : 19,
            source : {x: 33, y: 1}
        },

        {
            name : "magic",
            width : 9,
            height : 9,
            source : {x: 13, y: 17}
        },

        {
            name : "skull",
            width : 7,
            height : 7,
            source : {x: 23, y: 17}
        },

        {
            name : "smallcomet",
            width : 11,
            height : 11,
            source : {x: 1, y: 17}
        },

        {
            name : "darkcomet",
            width : 11,
            height : 11,
            source : {x: 1, y: 17},
            alpha : 0.4
        }
    ];
    var icons = {};
    var board = $("#board")[0];

    $(setups).each(function () {
        var setup = this;

        function Icon () {
            this.name = setup.name;
            this.type = "icon"
            this.sheet = "icons/icon_sprites.png";

            this.width = setup.width;
            this.height = setup.height;
            this.srcX = setup.source.x;
            this.srcY = setup.source.y;

            if (setup.alpha) {
                this.alpha = setup.alpha;
            }
        }

        Icon.prototype.draw = drawIcon;
        Icon.prototype.setLocation = function () { };

        icons[setup.name] = new Icon();
    });

    return icons;
})();

function Figure (player, type, index) {
    var figCount = (index < 10) ? "0" + String(index) : String(index);

    this.model = type;
    this.type = "figure";
    this.owner = player;
    this.heldBy = player;

    this.marker = false;
    this.musk = false;
    this.shield = false;

    this.skullIcon = Icons.skull
    this.draw = drawFigure;

    this.objectID = type.substr(0,3) + figCount + player.name.substr(0,3);
    this.objectID.toUpperCase();
}

Figure.prototype.clearAll = function () {
    this.marker = false;
    this.musk = false;
    this.shield = false;
    this.skull = false;
};

function Player ($powerSetupXML, $playerXML, index) {
    var modelTypes = ["cultist", "warrior", "daemon"],
        board = $("#board")[0],
        player = this,
        pluginName = $powerSetupXML.attr("plugin");

    this.name = $playerXML.attr("name");
    this.playerName = $playerXML.attr("playername");
    this.displayName = this.name.replace(/_/, " ");

    this.type = "player";
    this.idNum = index;
    this.$powerSetupXML = $powerSetupXML;
    this.$playerXML = $playerXML;

    if (pluginName) {
        this.plugin = board.plugins[pluginName];
    }

    this.highlight = $powerSetupXML.attr("highlight");
    this.shadow = $powerSetupXML.attr("shadow");
    this.ctx = board.ctx;
    this.map = board.map;

    this.cultists = [];
    this.warriors = [];
    this.daemons = [];
    this.noCorruption = ($powerSetupXML.attr("nocorruption") == "true");

    //Total figure counts
    this.figureCounts = {
        cultists : $powerSetupXML.find("cultists").text(),
        warriors : $powerSetupXML.find("warriors").text(),
        daemons : $powerSetupXML.find("daemons").text()
    };

    // For some reason, jQuery converts my string literals into String objects
    $(modelTypes).each(function () {
        var type = this.valueOf(),
            types = this + "s",
            figure;
        for (var k = 0; k < player.figureCounts[types]; k++) {
            figure = new Figure(player, type, k);
            player[types].push(figure);
        }
    });
}

Player.prototype.loadScoreboardData = function () {
    var player = this,
        $powerSetupXML = player.$powerSetupXML,
        $playerXML = player.$playerXML,
        $peasantsXMLArray,
        $allUpgrades,
        $heldUpgrades,
        $dialSetupXML,
        $dialXML,
        $cardXMLArray;

    // Peasant tokens
    player.peasants = [];
    $peasantsXMLArray = $playerXML.find("peasant"),
    $peasantsXMLArray.each(function () {
        var token = map.tokenPool.peasant.tokens.shift();
        if (token){
            player.peasants.push(token);
        }
    });

    // Upgrades
    player.upgrades = [];
    $allUpgrades = $powerSetupXML.find("upgrades").children(),
    $heldUpgrades = $playerXML.find("upgrades").children();
    $allUpgrades.each(function(){
        var isActive = $heldUpgrades.is(this.nodeName),
            $upgradeXML = $(this),
            plugin = player.plugin;

        function Upgrade (isActive) {
            this.name = $upgradeXML[0].nodeName;
            this.type = "upgrade";

            if (plugin) {
                this.sheet = "custom/" + plugin.name + "/icons/" +
                    plugin["upgradeSpritesSrc"];
            } else {
                this.sheet = board.upgradeSheet;
            }

            this.pp = Number($upgradeXML.attr("pp")) || 0;
            this.active = isActive;
            this.srcX = Number($upgradeXML.attr("srcx"));
            this.srcY = Number($upgradeXML.attr("srcy"));
            this.extraCard = ($upgradeXML.attr("extracard") === "true");
            this.coverCard = ($upgradeXML.attr("covercard") === "true");

            this.width = 23;
            this.height = 19;
        }

        Upgrade.prototype.draw = drawIcon;
        Upgrade.prototype.setLocation = function () { };

        player.upgrades.push(new Upgrade(isActive));
    });

    // PP and VP
    player.pp = $playerXML.find("pp").text();
    player.vp = $playerXML.find("vp").text();

    // Threat Dial
    $dialSetupXML = $powerSetupXML.find("dial");
    player.dialCap = Number($dialSetupXML.attr("cap"));
    player.threat = $dialSetupXML.text().split(',');
    $dialXML = $playerXML.find("dial");
    player.dialValue = Number($dialXML.find("value").text());
    player.dacs = Number($dialXML.find("dac").text()) || 0;

    // Load the card cache
    $cardXMLArray = $playerXML.children("cache").find("card");
    $cardXMLArray.each(function () {
        var $cardXML = $(this),
            newCard = new ChaosCard($cardXML);
        //Insert the card into the cache if the owner matches
        if (newCard.owner.name === player.name && newCard.cacheable) {
            map.cache.cards.push(newCard);
        }
    });
}

Player.prototype.draw = drawReserves;
Player.prototype.drag = dragObject;
Player.prototype.drop = dropObject;

/**
 * Constructor for an individual Old World Token pool.
 */
function TokenPool (name) {
    var board = document.getElementById("board");

    this.name = name;
    this.type = "pool";
    this.tokens = [];
    this.maxLength = 0;

    board.map.tokenPool[name] = this;
}

TokenPool.prototype.addToken = function(token) {
    this.tokens.push(token);
    this.maxLength = Math.max(this.maxLength, this.tokens.length);

    return this;
}

TokenPool.prototype.rows = function() {
    return Math.ceil(this.maxLength / 7);
}

function grabCardCanvas (evt) {
    var pen = $("#pen")[0];
    var board = $("#board")[0];
    var coord;
    var xOffset;
    var yOffset;
    //Check to be sure no object is held
    if (!pen.held){
        pen.held = copyObject(this.card);
        coord = this.cursorPos(evt);
        xOffset = coord.x;
        yOffset = coord.y;
        this.objectId = board.newOldWorldID();
        //Begin moving the card
        pen.move(evt, xOffset, yOffset);
    }

    document.onmouseup = function(evt){
        board.release(evt);
    };

    return false;
};

function Card () {}

Card.prototype.draw = drawCard;

Card.prototype.createCanvas = function () {
    var canvas = document.createElement("canvas");

    canvas.className = "card";
    canvas.width = 180;
    canvas.height = 17;
    canvas.card = this;

    canvas.cursorPos = getCursorPosition;
    $(canvas).on("mousedown", grabCardCanvas);

    this.canvasCtx = canvas.getContext('2d');
    return this.canvas = canvas;
};

ChaosCard.prototype = new Card();
ChaosCard.prototype.constructor = ChaosCard;
function ChaosCard ($cardXML) {
    var board = $("#board")[0];
    this.objectId = board.newChaosID();

    this.owner = board.allPlayers[$cardXML.attr("owner")];
    this.name = $cardXML.text();
    this.normalizedName = this.name.toLowerCase().replace(/^\s*the\s*/, "");
    this.type = "chaos";
    this.cost = $cardXML.attr("cost");

    this.cacheable = ($cardXML.attr("cacheable") === "true");
    this.holder = ($cardXML.attr("holder") === "true");
    this.skull = ($cardXML.attr("skull") === "true");
    this.magic = ($cardXML.attr("magic") === "true");

    this.magicIcon = Icons.magic;
    this.draw = drawCard;
}

OldWorldCard.prototype = new Card();
OldWorldCard.prototype.constructor = OldWorldCard;
function OldWorldCard ($cardXML) {
    var board = $("#board")[0];
    this.objectId = board.newOldWorldID();
    this.dataid = $cardXML.attr("dataid");

    this.name = $cardXML.text();
    this.type = "oldworld";
    this.event = ($cardXML.attr("event") === "true");
    this.active = ($cardXML.attr("active") === "true");

    this.holder = ($cardXML.attr("holder") === "true");
    this.skull = ($cardXML.attr("skull") === "true");

    this.symbol = Icons.smallcomet;
    this.symbol2 = Icons.darkcomet;
    this.draw = drawCard;
}

/* Build and draw a new board.  A value of true for
 * the "blank" parameter draws a blank board.
 */
function drawBoard(blank, local){
    var $board = $("#board"),
        board = $board[0],
        ctx = board.getContext('2d');
    //Clear the canvas
    var width = board.width,
        height = board.height;
    var state, expansion;
    board.ctx = ctx;
    if (local){
        //Check whether the game in local storage
        //has a matching game number
        var gamePick = document.getElementById("gamepick");
        var selectedGame = Number(gamePick.options[gamePick.selectedIndex].value);
        //Read the local board's game number and
        //state number from the XML doc
        var root = local.getElementsByTagName("boardstate")[0];
        var localGame = Number(root.getAttribute("game"));
        var localState = Number(root.getAttribute("state"));
        if (selectedGame == localGame){
            //Flag the board as unsaved if
            //from local storage
            unsavedBoard();
            state = local;
            //Set the board game and state
            board.game = localGame;
            board.state = localState;
            //Update the HTML controls
            var gameOption = document.getElementById("game" + board.game);
            gameOption.selected = true;
            getStates(null, board.game, board.state);
            //Update the save buttons
            updateSaveButtons();
        }
    }
    if (!state){
        //Flag the board as saved, if loading
        //from a save file
        unsavedBoard(true);
        state = getBoardState(blank, expansion);
    }
    ctx.fillStyle = "#332211";
    ctx.fillRect(0, 0, width, height);
    var i, j, k;
    //Create references to the XML gamestate data
    board.plugins = {
        "_list" : [],
        "_count" : 0
    };
    var $pluginList = $(state).find("customization").children("plugin")
    if ($pluginList.length > 0) {
        console.log($pluginList.length + " plugin(s) found.");

        var pluginLoader = new PluginLoader(board);
        $pluginList.each(function (index, node) {
            pluginLoader.addPlugin(node.textContent);
        });
    } else {
        console.warn("No plugins found.");
    }
    var mapXML = state.getElementsByTagName("map")[0];
    board.map = {
        idCrd : 0,
        idOWC : 0
    };
    var map = board.map;
    board.newChaosID = function () {
        var map = this.map,
            idString;
        map.idCrd++;
        idString = String(map.idCrd);
        idString = (idString.length == 1) ? "0" + idString : idString;
        return idString;
    };
    board.newOldWorldID = function () {
        var map = this.map,
            idString;
        map.idOWC++;
        idString = String(map.idOWC);
        idString = (idString.length == 1) ? "0" + idString : idString;
        return idString;
    };
    // Set up a jQuery object to hook a task queue to
    board.$afterPlugins = $({});
    map.$xmlData = $(mapXML);
    var $regionsXML = $(mapXML).find("region");
    var scoreXML = state.getElementsByTagName("scoreboard")[0];
    var $playerXMLArray = $(scoreXML).find("player");
    var playerCount = $playerXMLArray.length;
    var oldWorldXML = state.getElementsByTagName("oldworld")[0];
    //Check for the game type (for Chaos cards)
    board.expansion = state.documentElement.getAttribute("expansion");
    //Check for a game thread number (forums.penny-arcade.com/showthread.php?thread=...)
    board.threadNum = state.documentElement.getAttribute("thread");
    //Get the board setup
    var info = getGameSetup(board.expansion);
    board.info = info;
    board.tokenSheet = "icons/" + info.getElementsByTagName("tokens")[0].getAttribute("sheet");
    board.upgradeSheet = "icons/" + info.getElementsByTagName("upgrades")[0].getAttribute("sheet");
    //Check for the Old World card set
    board.owcset = oldWorldXML.getAttribute("set");
    //Load the Old World cards
    getOldWorldCards(board.owcset);
    //Create references to the XML setup data
    var $info = $(info);
    var $powerSetupXMLArray = $info.find("ruinouspowers").children();
    var $regionSetupXMLArray = $info.find("region");
    var regionCount = $regionSetupXMLArray.length;
    var $tokenSetupXML = $info.find("tokens").children();
    //Set up the old world tokens pool
    map.tokenPool = { "_list" : [] };
    var tempArray, tokenTypes;

    board.allTokens = [];
    $tokenSetupXML.each(function () {
        board.allTokens.push($(this));
    });

    board.$afterPlugins.queue("toDo", function (next) {
        $(board.allTokens).each(function () {
            var supply, count, pool
                $tokenXML = this,
                tokenName = $tokenXML[0].nodeName,
                plugin = board.plugins[$tokenXML.attr("plugin")];

            supply = Number($tokenXML.text());
            pool = new TokenPool(tokenName);
            map.tokenPool[tokenName] = pool;
            map.tokenPool._list.push(pool);

            count = 0;

            function Token () {
                var idString;

                this.name = tokenName;
                this.type = "token";
                this.home = pool;

                this.srcX = Number($tokenXML.attr("srcx"));
                this.srcY = Number($tokenXML.attr("srcy"));
                this.width = 19;
                this.height = 19;

                count += 1;
                idString = String(count);
                idString = (idString.length === 1) ? "0" + idString : idString;

                this.objectID = this.name.substr(0,3) + idString;
                this.objectID.toUpperCase();
            }

            if (plugin) {
                Token.prototype.plugin = plugin;
                Token.prototype.sheet = "custom/" + plugin.name + "/icons/" +
                    "token_sprites.png";
            } else {
                Token.prototype.sheet = board.tokenSheet;
            }

            Token.prototype.draw = drawIcon;
            Token.prototype.setLocation = storeIconLocation;

            for (j = 0; j < supply; j++){
                pool.addToken(new Token());
            }
        });

        console.log("Token Pools are set up");
        next();
    });

    var players = [];
    map.players = players;
    board.allPowers = {};
    var numPowers = 0;
    //Dump the XML data for the individual powers into
    //an object, as jQuery objects keyed by name
    $powerSetupXMLArray.each(function () {
        var name = $(this).find("name").text();
        board.allPowers[name] = $(this);
        numPowers += 1;
    });
    board.maxPowers = numPowers;

    board.$afterPlugins.queue("toDo", function (next) {
        board.allPlayers = {};

        $playerXMLArray.each(function (i) {
            var $currentPlayer = $(this),
                powerName = $currentPlayer.attr("name"),
                $powerSetupXML = board.allPowers[powerName],
                newPlayer = new Player($powerSetupXML, $currentPlayer, i);
            map.players.push(newPlayer);
            board.allPlayers[newPlayer.name] = newPlayer;
        });

        next();
    });

    //Load the Chaos Cards
    getChaosCards(board.expansion);
    //Set up the regions array
    map.regions = [];

    function CorruptionPile (region, player, $corruptionXML) {
        var amount = Number($corruptionXML.find("*[owner=" + player.name + "]").text());

        this.owner = player;
        this.value = amount || 0;
        this.min = 0;
        this.max = 20;
        this.region = region;
        this.draw = function () {
            this.region.draw();
        };
    }

    function CardSlot (holder, index) {
        this.type = "cardslot";
        this.longType = "Card Slot";
        this.drop = dropObject;
    }

    CardSlot.prototype.toString = function () {
        return this.longType + " " + this.index;
    }

    CardSlot.prototype.drop = dropObject;

    ChaosCardSlot.prototype = new CardSlot();
    ChaosCardSlot.prototype.constructor = ChaosCardSlot;
    function ChaosCardSlot (region, index) {
        this.figures = [];
        this.longType = "Chaos Card Slot: " + region.name;
        this.heldBy = region;
        this.index = index;
    }

    OldWorldCardSlot.prototype = new CardSlot();
    OldWorldCardSlot.prototype.constructor = OldWorldCardSlot;
    function OldWorldCardSlot (holder, index) {
        this.figures = [];
        this.longType = "Old World Card Slot"
        this.heldBy = holder;
        this.index = index;
    }

    function Region ($regionSetupXML) {
        this.name = $regionSetupXML.find("name").text();
        this.shortName = $regionSetupXML.attr("short");
        this.$regionSetupXML = $regionSetupXML;
        this.$regionXML = map.$xmlData.find("region[name='" + this.name + "']")

        this.draw = drawRegion;
        this.drag = dragObject;
        this.drop = dropObject;
        this.ctx = ctx;

        this.players = players;
        this.populated = ($regionSetupXML.attr("populated") === "true");
        this.resistance = $regionSetupXML.find("resistance").text();
        this.type = "region";
        this.map = map;

        this.toString = function () {
            return "Region: " + region.name;
        };
    }

    Region.prototype.setupBorders = function () {
        var $borderXML = this.$regionSetupXML.find("border"),
            $allLinkXML,
            region = this;

        //Set up the region's border and links
        //to adjacent regions
        region.border = {
            row : Number($borderXML.attr("row")),
            col : Number($borderXML.attr("col"))
        };

        $allLinkXML = $borderXML.find("link");
        region.links = [];
        $allLinkXML.each(function () {
            region.links.push($(this).text());
        });
    };

    Region.prototype.setupCorruption = function () {
        var $corruptionXML = this.$regionXML.find("corruption");
        this.corruption = [];

        for (var j = 0; j < playerCount; j++) {
            if (players[j].noCorruption) {
                break;
            }
            this.corruption.push(new CorruptionPile(this, players[j], $corruptionXML));
        }
    };

    Region.prototype.setupRuination = function () {
        var region = this,
            $ruinTemp;

        //Set up the region's ruination values
        region.ruination = [];
        this.$regionSetupXML.find("ruination").children().each(function (j) {
            region.ruination[j] = $(this).text();
        });

        //Set the region's ruination rank, if ruined
        $ruinTemp = this.$regionXML.find("ruined");
        region.ruined = this.$ruinTemp ? $ruinTemp.text() : 0;

    };

    Region.prototype.setupChaosCards = function () {
        var $allCardsXML = this.$regionXML.find("card"),
            region = this;
        region.cards = [];

        $allCardsXML.each(function () {
            var $cardXML = $(this);
            var newCard = new ChaosCard($cardXML);
            var ownerName = $cardXML.attr("owner");
            var owner = board.allPowers[ownerName];
            region.cards.push(newCard);
        });
    };

    Region.prototype.setupTokens = function () {
        var $allTokenXML = this.$regionXML.find("tokens").children(),
            region = this;
        region.tokens = [];

        $allTokenXML.each(function () {
            var token = region.map.tokenPool[this.nodeName].tokens.shift();
            if (token) {
                region.tokens.push(token);
                token.heldBy = region;
            }
        });
    };

    Region.prototype.setupFigures = function () {
        var $regionFigureXML = this.$regionXML.find("figures").children(),
            $figureSlots = this.$regionXML.find("slot"),
            region = this;

        function addFigureToHolder ($figureXML, holder) {
            var playerName = $figureXML.attr("owner"),
                figTypes = $figureXML[0].nodeName + "s",
                figure = board.allPowers[playerName][figTypes].shift();
            if (figure){
                figure.shield = ($figureXML.attr("shield") === "true");
                figure.musk = ($figureXML.attr("musk") === "true");
                figure.marker = ($figureXML.attr("marker") === "true");
                figure.skull = ($figureXML.attr("skull") === "true");
            }
            holder.figures.push(figure);
            figure.heldBy = holder;
        }

        // Create base region and card slot figure holders
        region.figures = [];
        region.slots = [];
        for (var j = 0; j < 3; j++) {
            region.slots[j] = new ChaosCardSlot(region, j);
        }

        //Handle figures in the region base
        $regionFigureXML.each(function () {
            addFigureToHolder($(this), region);
        });

        //Handle figures in the slots
        $figureSlots.each(function () {
            var $slotXML = $(this),
                $slotFigureXML = $slotXML.children(),
                slotID = $slotXML.attr("slotid");

            $slotFigureXML.each(function () {
                addFigureToHolder($(this), region.slots[slotID]);
            });
        });
    };

    Region.prototype.setup = function () {
        var region = this;

        board.$afterPlugins.queue("toDo", function (next) {
            //console.log("Setting up " + region.name);
            region.setupBorders();
            region.setupCorruption();
            region.setupRuination();
            region.setupChaosCards();
            region.setupFigures();
            region.setupTokens();
            next();
        });
    };

    $regionSetupXMLArray.each(function () {
        var newRegion = new Region($(this));
        newRegion.setup();

        board.map.regions.push(newRegion);
    });

    //Create a method to count ruined regions
    board.numRuined = function () {
        var count = 0;
        $(this.map.regions).each(function (j) {
            if (this.ruined) {
                count += 1;
            }
        });
        return count;
    };
    //Construct the stack of ruination cards
    board.$afterPlugins.queue("toDo", function (next) {
        board.ruination = [];
        var ruinCard;
        var ruinersArray = [3, 4, 4, 5, 5];  //VP for ruiners
        for (var i = 0; i < 5; i++) {
            ruinCard = {
                ruiners : ruinersArray[i],
                regions : [],
                draw : drawRuination,
                map : map,
                ctx : ctx,
                index : i
            };
            $(board.map.regions).each(function (j) {
                ruinCard.regions[j] = this.ruination[i];
            });
            board.ruination[i] = ruinCard;
        }

        next();
    });

    function CardCache () {
        this.players = players;
        this.ctx = ctx;
        this.cards = [];
        this.type = "cache";

        this.drag = dragObject;
        this.drop = dropObject;
        this.drawMe = drawCache;
        this.draw = function () {
            map.score.drawMe();
            map.cache.drawMe();
        }
    }

    map.cache = new CardCache();

    function Scoreboard () {
        this.ctx = ctx;
        this.players = map.players;

        this.drawMe = drawScoreBoard;
        this.draw = function () {
            map.score.drawMe();
            map.cache.drawMe();
        }

        // Set up each player's data
        $(this.players).each(function (i) {
            this.loadScoreboardData();
        });

        // Fire the "scoreboard loaded" notice
        console.log("Firing 'scoreboardLoaded' event");
        $("#board").trigger('scoreboardLoaded');
    }

    // Set up the scoreboard
    board.$afterPlugins.queue("toDo", function (next) {
        board.map.score = new Scoreboard();
        next();
    });
    // Draw the regions
    board.$afterPlugins.queue("toDo", function (next) {
        //console.log("Drawing regions");
        $(board.map.regions).each(function () {
            this.draw();
        });
        next();
    });
    // Identify the current ruination card and draw it
    board.$afterPlugins.queue("toDo", function (next) {
        var numRuined = Math.min(board.numRuined(), 4);
        map.ruinCard = board.ruination[numRuined];
        map.ruinCard.draw();
        next();
    });
    // Draw the scoreboard
    board.$afterPlugins.queue("toDo", function (next) {
        board.map.score.draw();
        next();
    });
    // Set up the scoreboard controls
    board.$afterPlugins.queue("toDo", function (next) {
        buildScoreBoardControls();
        next();
    });

    function OldWorldTrack ($oldWorldXML) {
        var $oldWorldCardXMLArray = $oldWorldXML.find("card"),
            $figureSlotXMLArray = $oldWorldXML.find("slot");
        var oldWorld = this;

        this.type = "oldworldtrack";
        this.$oldWorldXML = $oldWorldXML;
        this.ctx = ctx;

        this.draw = drawOldWorld;
        this.drag = dragObject;
        this.drop = dropObject;

        this.cards = [];
        this.slider = $("#activate")[0];

        // Set up Old World Cards
        $oldWorldCardXMLArray.each(function () {
            var $cardXML = $(this),
                newCard = new OldWorldCard($cardXML);
            oldWorld.cards.push(newCard);
        });

        // Set up figure slots
        oldWorld.slots = [];
        for (var i = 0; i < 7; i++) {
            oldWorld.slots.push(new OldWorldCardSlot(oldWorld, i));
        }

        // Put figures in slots
        $figureSlotXMLArray.each(function () {
            var $figureSlotXML = $(this),
                slotID = Number($figureSlotXML.attr("slotid")),
                $figureXMLArray = $figureSlotXML.children();
            $figureXMLArray.each(function () {
                var $figureXML = $(this),
                    playerName = $figureXML.attr("owner"),
                    figTypes = $figureXML[0].nodeName + "s",
                    figure = board.allPlayers[playerName][figTypes].shift();
                if (figure) {
                    figure.shield = ($figureXML.attr("shield") === "true");
                    figure.musk = ($figureXML.attr("musk") === "true");
                    figure.marker = ($figureXML.attr("marker") === "true");
                    figure.skull = ($figureXML.attr("skull") === "true");

                    oldWorld.slots[slotID].figures.push(figure);
                    figure.heldBy = oldWorld.slots[slotID];
                }
            });
        });

        // Set up the active card selection slider
        this.slider.cards = oldWorld.cards;
        this.slider.draw = drawOldWorldActive;
    }

    // Set up the Old World track
    board.$afterPlugins.queue("toDo", function (next) {
        map.oldWorld = new OldWorldTrack($(oldWorldXML));
        next();
    });

    // Draw the Old World track
    board.$afterPlugins.queue("toDo", function (next) {
        map.oldWorld.draw();
        next();
    });
    // Draw the remaining Old World tokens
    board.$afterPlugins.queue("toDo", function (next) {
        buildTokenPool();
        next();
    });

    // Draw figure reserves
    board.$afterPlugins.queue("toDo", function (next) {
        $(players).each(function () {
            this.draw();
        });
        next();
    });

    // Set up the figure workshop
    board.$afterPlugins.queue("toDo", function (next) {
        board.workshop = buildWorkshop();
        next();
    });
    // Set up the corruption controls;
    board.$afterPlugins.queue("toDo", function (next) {
        board.corruption = buildCorruption();
        next();
    });

    // Set up the callback to execute the queued tasks
    if (board.plugins) {
        $board.on("pluginLoaded", function () {
            var allPluginsLoaded = true;

            console.log("Custom event pluginLoaded captured!");

            $(board.plugins._list).each(function (index, plugin) {
                if (!plugin.isLoaded()) {
                    allPluginsLoaded = false;
                }
            });

            if (allPluginsLoaded) {
                console.log("Deferred board setup (with plugins)");
                board.$afterPlugins.dequeue("toDo");
            } else {
                console.log("Not all plugins are loaded yet.");
            }
        });
    } else {
        console.log("Deferred board setup (without plugins)");
        board.$afterPlugins.dequeue("toDo");
    }
    //Set event handlers on the canvas and
    //on the holding pen
    board.cursorPos = getCursorPosition;
    var pen = document.getElementById("pen");
    pen.move = mobileCanvas;
    //Create the mousedown handler
    board.press = function(evt){
        //Check to be sure no object is held
        if (!pen.held){
            var l;
            var coord = this.cursorPos(evt);
            var x = coord.x;
            var y = coord.y;
            //Check for an object source
            //area under the cursor
            var areas = this.map.regions.concat(this.map.players);
            areas.push(this.map.oldWorld);
            areas.push(this.map.cache);
            for (l = 0; l < areas.length; l++){
                if (areas[l].x0 <= x && x < areas[l].x1 && areas[l].y0 <= y && y < areas[l].y1){
                    areas[l].drag(evt, x, y);
                    break;
                }
            }
        }
        var board = this;
        document.onmouseup = function(evt){
            var board = document.getElementById("board");
            board.release(evt);
        };
        return false;
    };
    //Create the mouseup handler
    board.release = function(evt){
        var pen = document.getElementById("pen");
        //Check for a held object
        if (pen.held){
            var i, j;
            var coord = this.cursorPos(evt);
            var x = coord.x;
            var y = coord.y;
            //Check for an object target
            //area under the cursor
            var slots = [];
            var regionCount = this.map.regions.length;
            for (i = 0; i < regionCount; i++) {
                for (j = 0; j < 3; j++) {
                    slots.push(this.map.regions[i].slots[j]);
                }
            }
            var oldWorldCount = this.map.oldWorld.slots.length;
            for (i = 0; i < oldWorldCount; i++) {
                slots.push(this.map.oldWorld.slots[i]);
            }
            var areas = slots.concat(this.map.regions, [this.map.oldWorld]);
            for (i = 0; i < areas.length; i++){
                if (areas[i].x0 <= x && x < areas[i].x1 && areas[i].y0 <= y && y < areas[i].y1){
                    areas[i].drop();
                    break;
                }
            }
            if (i == areas.length){
                //Attempt to drop a figure in
                //the workshop
                if (pen.held.model){
                    var workshop = document.getElementById("workshop");
                    workshop.release(evt);
                }
                else if (pen.held.type == "token" || pen.held.type == "chaos"){
                    //Score peasants or cacheable cards dropped on the scoreboard
                    if (pen.held.name == "peasant" || pen.held.cacheable){
                        var players = this.map.players;
                        var currentRow;
                        for (i = 0; i < players.length; i++){
                            currentRow = players[i].playerRow;
                            if (currentRow.x0 <= x && x < currentRow.x1 && currentRow.y0 <= y && y < currentRow.y1){
                                players[i].playerRow.drop();
                                var fieldName = players[i].name + "_peasants";
                                var control = document.getElementById(fieldName);
                                control.value = players[i].peasants.length;
                                break;
                            }
                        }
                        if (i == players.length){
                            //Attempt to drop a cacheable card at the rendered cache
                            if (pen.held.cacheable) {
                                var cache = this.map.cache;
                                if (cache.x0 <= x && x < cache.x1 && cache.y0 <= y && y < cache.y1) {
                                    cache.drop();
                                }
                                else {
                                    pen.held = null;
                                }
                            }
                            else {
                                pen.held.home.drop();
                            }
                        }
                    }
                    else if (pen.held.home) {
                        //Return stray tokens to their pool
                        pen.held.home.drop();
                    }
                    else {
                        pen.held = null;
                    }
                }
                //Clear any object other than a figure
                else {
                    pen.held = null;
                    //If the object was removed from a board
                    //location, flag the board as unsaved
                    if (pen.source != null){
                        pen.source = null;
                        unsavedBoard();
                    }
                }
            }
        }
        document.onmouseup = null;
    };
    board.onmousedown = board.press;
    //Set a handler for the onunload event that
    //saves the board to local storage if it
    //reports that it is unsaved
    window.onunload = function(){
        board = document.getElementById("board");
        if (!board.saved){
            saveBoardXML("local");
        }
    };
    //Hook up the figure effects reset control
    var effectButton = document.createElement("input");
    effectButton.type = "button";
    effectButton.className = "right";
    effectButton.disabled = "disabled";
    effectButton.value = "Go!";
    var toggleEffect = createToggleSwitch(effectButton, null, null, "disabled", true);
    toggleEffect.className += " right";
    $resetEffect = $("#reseteffects");
    $resetEffect.append(effectButton);
    $resetEffect.append(toggleEffect);
    effectButton.onclick = function(){
        clearEffects();
        toggleEffect.flip();
    };
}

/* Find the object (if any) that is the target
 * of a mouseclick within an area, and
 * activate it or begin dragging it.
 */
function dragObject(evt, x, y){
    var pen = document.getElementById("pen");
    //Figures in a region
    var figs = this.figures || [];
    //Figures on a card slot
    var slotFigs = [];
    var i;
    if (this.slots) {
        for (i = 0; i < this.slots.length; i++) {
            slotFigs[i] = this.slots[i].figures;
        }
    }
    //Figures in reserves
    var culs = this.cultists || [];
    var wars = this.warriors || [];
    var daes = this.daemons || [];
    var toks = this.tokens || [];
    var crds = this.cards || [];
    var objects = slotFigs.concat([figs, culs, wars, daes, toks, crds]);
    var i, j, xOffset, yOffset, nullCard;
    for (i = 0; i < objects.length; i++){
        for (j = 0; j < objects[i].length; j++){
            if (objects[i][j].x0 <= x && x < objects[i][j].x1 && objects[i][j].y0 <= y && y < objects[i][j].y1){
                pen.held = objects[i].splice(j, 1)[0];
                pen.source = this;
                xOffset = x - pen.held.x0;
                yOffset = y - pen.held.y0;
                //If the object being grabbed is a card, leave
                //behind any figures
                if (pen.held.slot) {
                    pen.held.slot = null;
                }
                pen.move(evt, xOffset, yOffset);
                break;
            }
        }
        if (pen.held) {
            break;
        }
    }
}

/* Attempt to place the held object in
 * the invoking container.
 */
function dropObject(){
    var pen = document.getElementById("pen");
    //Identify the type of object
    var type = pen.held.type;
    var name = pen.held.name;
    var objects;
    var target = this;
    var holder;
    var targetSlot;
    var cache;
    if (this.type  === "cardslot") {
        holder = this.heldBy.cards[this.index] && this.heldBy.cards[this.index].holder;
        if (type !== "figure") {
            if (type === "chaos") {
                currentUpgrades = pen.held.owner
                                        ? (pen.held.owner.upgrades
                                                ? pen.held.owner.upgrades
                                                : [])
                                        : [];
                for (j = 0; j < currentUpgrades.length; j++){
                    if (currentUpgrades[j].coverCard && currentUpgrades[j].active){
                        targetSlot = this.index;
                        break;
                    }
                }
            }
            target = this.heldBy;
        } else if (!holder) {
            target = this.heldBy.type === "region"
                           ? this.heldBy
                           : pen.held.owner;
        }
    }
    if (type == "chaos" && target.type == "region"){
        objects = target.cards;
    }
    else if (type == "chaos" && (target.type == "playerrow" || target.type == "cache")) {
        cache = $("#board")[0].map.cache;
        objects = cache.cards;
    }
    else if (type == "oldworld" && target.type == "oldworldtrack"){
        objects = target.cards;
    }
    else if (type == "token" && (target.type == "region" || target.type == "pool")){
        objects = target.tokens;
    }
    else if (type == "token" && name == "peasant" && target.type == "playerrow"){
        objects = target.tokens;
    }
    else if (type == "figure" && (target.type == "region" || target.type == "workshop" || target.type == "cardslot" )){
        objects = target.figures;
    }
    else if (type == "figure" && target.type == "player"){
        var figTypes = pen.held.model + "s";
        objects = target[figTypes];
        //Strip effects when returning a
        //figure to reserves
        pen.held.clearAll();
    }
    //If the destination matches the object,
    //place it and redraw the destination
    if (objects){
        //Overwrite the existing object in
        //the targeted slot, if applicable
        if (!isNaN(targetSlot) && objects[targetSlot]) {
            objects[targetSlot] = pen.held;
        } else {
            objects.push(pen.held);
        }
        //If the target is a card that holds dead
        //figures, clear figure effects and set
        //the skull marker
        if (type === "figure" && !isNaN(target.index) && target.heldBy.cards && target.heldBy.cards[target.index].skull) {
            pen.held.clearAll();
            pen.held.skull = true;
        }
        if (target.type === "cardslot") {
            target.heldBy.draw();
        } else {
            target.draw();
        }
        //If the destination is different than
        //the source, flag the board as "unsaved"
        if (this !== pen.source){
            unsavedBoard();
        }
        pen.held = null;
    }
    else if (pen.source){
        pen.source.draw();
    }
    if (pen.held != null && pen.source != null){
        unsavedBoard();
    }
    pen.held = null;
    pen.source = null;
}

/* Create a draggable canvas, and draw
 * the object being dragged on it.
 */
function mobileCanvas(evt, xOffset, yOffset){
    var body = document.getElementById("body");
    //Create the canvas element
    this.canvas = document.createElement("canvas");
    var ctx = this.canvas.getContext('2d');
    this.canvas.id = "mobile";
    this.canvas.className = "drag";
    //Create a div to put the canvas in
    var dragDiv = document.createElement("div");
    dragDiv.className = "dragframe";
    dragDiv.appendChild(this.canvas);
    body.appendChild(dragDiv);
    body.cursorPos = getCursorPosition;
    var coord = body.cursorPos(evt);
    //Retrieve the relevant style measures
    //from the div
    var styles = getComputedStyle(dragDiv, null) || dragDiv.currentStyle;
    var lborder = Number(styles.borderLeftWidth.replace(/[^0-9]/g,""));
    var lpadding = Number(styles.paddingLeft.replace(/[^0-9]/g,""));
    var tborder = Number(styles.borderTopWidth.replace(/[^0-9]/g,""));
    var tpadding = Number(styles.paddingTop.replace(/[^0-9]/g,""));
    //Set the initial position of the div
    var xOffsetEff = xOffset + lborder + lpadding;
    var yOffsetEff = yOffset + tborder + tpadding;
    var moveLeft = coord.x - xOffsetEff - 13;
    var moveTop = coord.y - yOffsetEff - 11;
    dragDiv.style.left = moveLeft + "px";
    dragDiv.style.top = moveTop + "px";
    this.canvas.width = 200;
    this.canvas.height = 50;
    var pen = this;
    //pen.held.moving = true;
    //Draw the held object
    //Figure
    if (pen.held.model){
        var height = pen.held.y1 - pen.held.y0;
        pen.held.draw(13, height + 10, ctx);
    }
    //Token
    else if (pen.held.icon){
        pen.held.draw(13, 11, ctx);
    }
    //Card
    else {
        pen.held.draw(13, 11, ctx);
    }
    //Move the containing div with
    //the mouse.  Redraw the source
    //area on the first movement.
    var source = pen.source;
    dragDiv.onmousemove = function(evt){
        if (source && source.draw){
            source.draw();
            source = null;
        }
        var bodyCoord = body.cursorPos(evt);
        var x = bodyCoord.x - xOffsetEff - 10;
        var y = bodyCoord.y - yOffsetEff - 10;
        this.style.left = x + "px";
        this.style.top = y + "px";
    };
    //Stop moving the div on mouseup, and
    //get rid of the div and canvas
    dragDiv.onmouseup = function(){
        if (source && source.draw){
            source.draw();
        }
        document.onmousemove = null;
        body.removeChild(this);
        pen.canvas = null;
    };
}

/* Set handlers to open one of the
 * card or token lists.
 */
function clickOpen(linked){
    this.className = this.className + " down";
    this.onmouseup = function(){
        var obj = this;
        obj.next.close();
        obj.next.onmouseup();
        obj.next.next.close();
        obj.next.next.onmouseup();
        var openTimer = setTimeout(function(){
            obj.items.className = obj.items.className + " open";
            if (obj.items2){
                obj.items2.className = obj.items2.className + " open";
            }
            obj.items.parentNode.className = obj.items.parentNode.className + " upper";
            obj.onmousedown = clickClosed;
            obj.onmouseup = null;
            obj.onmouseout = null;
        }, 200);
    }
    this.onmouseout = function(){
        this.className = this.className.replace(/( )?down/g,"");
        this.onmousedown = clickOpen;
        this.onmouseup = null;
        this.onmouseout = null;
    }
    return false;
}

/* Set handlers to close one of the
 * card or token lists.
 */
function clickClosed(){
    this.onmouseup = function(){
        this.className = this.className.replace(/( )?down/g,"");
        this.items.className = this.items.className.replace(/( )?open/g,"");
        if (this.items2){
            this.items2.className = this.items2.className.replace(/( )?open/g,"");
        }
        this.items.parentNode.className = this.items.parentNode.className.replace(/( )?upper/g,"");
        this.onmousedown = clickOpen;
        this.onmouseup = null;
        this.onmouseout = null;
    }
    this.onmouseout = function(){
        this.onmousedown = clickClosed;
        this.onmouseup = null;
        this.onmouseout = null;
    }
    return false;
}

/* Save the current board state to the server
 * as an XML document.
 */
function saveBoardXML(saveType){
    var fail, i, gameNumber, gameState;
    var board = document.getElementById("board");
    //Create the XML save data (regardless of
    //whether there was an error that will
    //prevent saving on the server)
    var makeXML = function(gameNumber, gameState, newGame, local){
        var i, j, k, node, node2, node3, textNode, value;
        //Create the board and find the root element
        var xmlDoc = newXMLDocument("boardstate");
        var boardState = xmlDoc.documentElement;
        //Set the board's creator
        if (saveType == "newgame"){
            boardState.setAttribute("creator", userName);
        }
        else {
            boardState.setAttribute("creator", board.creator);
        }
        //Set the game and state numbers
        boardState.setAttribute("game", gameNumber || board.game);
        boardState.setAttribute("state", gameState || board.state);
        //Set the game expansion
        boardState.setAttribute("expansion", board.expansion);
        //Set the game thread number
        boardState.setAttribute("thread", board.threadNum);
        //Old World cards
        var oldWorld = xmlDoc.createElement("oldworld");
        oldWorld.setAttribute("set", board.owcset);
        var cards = board.map.oldWorld.cards;
        var slots = board.map.oldWorld.slots;
        for (i = 0; i < cards.length; i++){
            //Card data
            node = xmlDoc.createElement("card");
            textNode = xmlDoc.createTextNode('');
            textNode.data = cards[i].name;
            node.appendChild(textNode);
            if (cards[i].active){
                node.setAttribute("active","true");
            }
            if (cards[i].event){
                node.setAttribute("event","true");
            }
            if (cards[i].holder){
                node.setAttribute("holder","true");
            }
            if (cards[i].skull){
                node.setAttribute("skull","true");
            }
            oldWorld.appendChild(node);
            //Figures in card slot
            if (slots[i].figures && slots[i].figures.length > 0) {
                node = xmlDoc.createElement("slot");
                node.setAttribute("slotid", i);
                for (j = 0; j < slots[i].figures.length; j++) {
                    node2 = xmlDoc.createElement(slots[i].figures[j].model);
                    node2.setAttribute("owner", slots[i].figures[j].owner.name);
                    if (slots[i].figures[j].shield){
                        node2.setAttribute("shield", "true");
                    }
                    if (slots[i].figures[j].musk){
                        node2.setAttribute("musk", "true");
                    }
                    if (slots[i].figures[j].marker){
                        node2.setAttribute("marker", "true");
                    }
                    if (slots[i].figures[j].skull){
                        node2.setAttribute("skull", "true");
                    }
                    node.appendChild(node2);
                }
                oldWorld.appendChild(node);
            }
        }
        boardState.appendChild(oldWorld);
        //Scoreboard
        var scoreBoard = xmlDoc.createElement("scoreboard");
        var players = board.map.players;
        for (i = 0; i < players.length; ++i){
            node = xmlDoc.createElement("player");
            node.setAttribute("name", players[i].name);
            node.setAttribute("playername", players[i].playerName);
            //Peasants
            node2 = xmlDoc.createElement("tokens");
            for (j = 0; j < players[i].peasants.length; j++){
                node3 = xmlDoc.createElement("peasant");
                node2.appendChild(node3);
            }
            node.appendChild(node2);
            //Upgrades
            node2 = xmlDoc.createElement("upgrades");
            for (j = 0; j < players[i].upgrades.length; j++){
                if (players[i].upgrades[j].active){
                    node3 = xmlDoc.createElement(players[i].upgrades[j].name);
                    node2.appendChild(node3);
                }
            }
            node.appendChild(node2);
            //PP
            node2 = xmlDoc.createElement("pp");
            textNode = xmlDoc.createTextNode('');
            textNode.data = players[i].pp;
            node2.appendChild(textNode);
            node.appendChild(node2);
            //VP
            node2 = xmlDoc.createElement("vp");
            textNode = xmlDoc.createTextNode('');
            textNode.data = players[i].vp;
            node2.appendChild(textNode);
            node.appendChild(node2);
            //Threat dial
            node2 = xmlDoc.createElement("dial");
            node2.setAttribute("cap", players[i].dialCap);
            node3 = xmlDoc.createElement("value");
            textNode = xmlDoc.createTextNode('');
            textNode.data = players[i].dialValue;
            node3.appendChild(textNode);
            node2.appendChild(node3);
            node3 = xmlDoc.createElement("dac");
            textNode = xmlDoc.createTextNode('');
            textNode.data = players[i].dacs;
            node3.appendChild(textNode);
            node2.appendChild(node3);
            node.appendChild(node2);
            //Cached cards
            if (players[i].cache && players[i].cache.length > 0) {
                node2 = xmlDoc.createElement("cache");
                for (j = 0; j < players[i].cache.length; j++) {
                    node3 = xmlDoc.createElement("card");
                    node3.setAttribute("cost", players[i].cache[j].cost);
                    if (players[i].cache[j].owner){
                        node3.setAttribute("owner", players[i].cache[j].owner.name);
                    }
                    if (players[i].cache[j].magic){
                        node3.setAttribute("magic", true);
                    }
                    if (players[i].cache[j].holder){
                        node3.setAttribute("holder", true);
                    }
                    if (players[i].cache[j].skull){
                        node3.setAttribute("skull", true);
                    }
                    if (players[i].cache[j].cacheable){
                        node3.setAttribute("cacheable", true);
                    }
                    textNode = xmlDoc.createTextNode('');
                    textNode.data = players[i].cache[j].name;
                    node3.appendChild(textNode);
                    node2.appendChild(node3);
                }
                node.appendChild(node2);
            }
            scoreBoard.appendChild(node);
        }
        boardState.appendChild(scoreBoard);
        //Regions map
        var map = xmlDoc.createElement("map");
        var regions = board.map.regions;
        var slot;
        for (i = 0; i < regions.length; i++){
            //Region name
            node = xmlDoc.createElement("region");
            node.setAttribute("name", regions[i].name);
            //Old World tokens
            node2 = xmlDoc.createElement("tokens");
            for (j = 0; j < regions[i].tokens.length; j++){
                node3 = xmlDoc.createElement(regions[i].tokens[j].name);
                node2.appendChild(node3);
            }
            node.appendChild(node2);
            //Chaos cards
            node2 = xmlDoc.createElement("chaos");
            for (j = 0; j < regions[i].cards.length; j++){
                node3 = xmlDoc.createElement("card");
                node3.setAttribute("cost", regions[i].cards[j].cost);
                if (regions[i].cards[j].owner){
                    node3.setAttribute("owner", regions[i].cards[j].owner.name);
                }
                if (regions[i].cards[j].magic){
                    node3.setAttribute("magic", true);
                }
                if (regions[i].cards[j].holder){
                    node3.setAttribute("holder", true);
                }
                if (regions[i].cards[j].skull){
                    node3.setAttribute("skull", true);
                }
                if (regions[i].cards[j].cacheable){
                    node3.setAttribute("cacheable", true);
                }
                textNode = xmlDoc.createTextNode('');
                textNode.data = regions[i].cards[j].name;
                node3.appendChild(textNode);
                node2.appendChild(node3);
                if (regions[i].slots[j].figures && regions[i].slots[j].figures.length > 0) {
                    node3 = xmlDoc.createElement("slot");
                    node3.setAttribute("slotid", j);
                    slot = regions[i].slots[j];
                    for (k = 0; k < slot.figures.length; k++) {
                        node4 = xmlDoc.createElement(slot.figures[k].model);
                        node4.setAttribute("owner", slot.figures[k].owner.name);
                        if (slot.figures[k].shield){
                            node4.setAttribute("shield", "true");
                        }
                        if (slot.figures[k].musk){
                            node4.setAttribute("musk", "true");
                        }
                        if (slot.figures[k].marker){
                            node4.setAttribute("marker", "true");
                        }
                        if (slot.figures[k].skull){
                            node4.setAttribute("skull", "true");
                        }
                        node3.appendChild(node4);
                    }
                    node2.appendChild(node3);
                }
            }
            node.appendChild(node2);
            //Corruption
            for (j = 0; j < regions[i].corruption.length; j++){
                value = regions[i].corruption[j].value;
                if (value > 0){
                    node2 = xmlDoc.createElement("corruption");
                    node2.setAttribute("owner", regions[i].corruption[j].owner.name);
                    textNode = xmlDoc.createTextNode('');
                    textNode.data = value;
                    node2.appendChild(textNode);
                    node.appendChild(node2);
                }
            }
            //Ruin
            value = regions[i].ruined;
            if (value > 0){
                node2 = xmlDoc.createElement("ruined");
                textNode = xmlDoc.createTextNode('');
                textNode.data = value;
                node2.appendChild(textNode);
                node.appendChild(node2);
            }
            //Figures
            node2 = xmlDoc.createElement("figures");
            for (j = 0; j < regions[i].figures.length; j++){
                node3 = xmlDoc.createElement(regions[i].figures[j].model);
                node3.setAttribute("owner", regions[i].figures[j].owner.name);
                if (regions[i].figures[j].shield){
                    node3.setAttribute("shield", "true");
                }
                if (regions[i].figures[j].musk){
                    node3.setAttribute("musk", "true");
                }
                if (regions[i].figures[j].marker){
                    node3.setAttribute("marker", "true");
                }
                node2.appendChild(node3);
            }
            node.appendChild(node2);
            map.appendChild(node);
        }
        boardState.appendChild(map);
        //Serialize the document
        var serializer = new XMLSerializer();
        var xmlString = encodeURIComponent(serializer.serializeToString(boardState));
        //Send the serialized XML document
        //to the server with an AJAX request,
        //unless the request is to save locally
        if (!local) {
            var xmlhttp = xmlRequest();
            if (xmlhttp) {
                xmlhttp.onreadystatechange = function(){
                    if (this.readyState == 4 && this.status == 200){
                        if (this.responseText.search("ERROR") >= 0){
                            showMessage(this.responseText, "error");
                            //Save the XML document to local storage
                            //if there was a problem
                            if (checkCompatibility().localStorage){
                                localStorage["gameboard"] = xmlString;
                            }
                        }
                        else {
                            //Update the object game and save numbers
                            //for the current game
                            var board = document.getElementById("board");
                            board.game = gameNumber;
                            board.state = gameState;
                            //If the save represents a new game, update
                            //the game list
                            updateGameStateList(gameNumber, gameState);
                            //Show the "Success!" message
                            showMessage(this.responseText, "okay");
                            //Turn off the "unsaved" flags
                            unsavedBoard(true);
                        }
                    }
                };
                var overwrite = (saveType == "overwrite") ? 1 : 0;
                xmlhttp.open("POST", "savexml.php", true);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xmlhttp.send('game=' + gameNumber + '&state=' + gameState + '&user=' + userName + '&over=' + overwrite + '&data='+ xmlString);
            }
        }
        //Save the XML document to local
        //storage if it can't be saved
        //on the server
        else {
            if (checkCompatibility().localStorage){
                localStorage["gameboard"] = xmlString;
            }
        }
    }
    //"Fail" directly to local storage if
    //saveType == "local"
    if (saveType == "local"){
        fail = true;
    }
    else {
        //Verify that the user is logged in
        var userLevel = document.getElementById("userlevel").value;
        var userName = document.getElementById("username") ? document.getElementById("username").firstChild.data : null;
        if (!(userLevel > 0)){
            fail = true;
            showMessage("ERROR: Must be logged in to save", "error");
        }
        //New game
        else if (saveType == "newgame"){
            //Verify permission level for a user
            //trying to save a new 0000-series game
            gameState = "01";
            gameNumber = document.getElementById("savegamenum").value;
            while (gameNumber.length < 4){
                gameNumber = "0" + gameNumber;
            }
            if (gameNumber < 1000 && userLevel < 2){
                fail = true;
                showMessage("ERROR: Insufficient user permissions", "error");
            }
            //Check to be sure the game doesn't
            //exist already
            else {
                var gamePick = document.getElementById("gamepick");
                for (i = 0; i < gamePick.options.length; i++){
                    if (gamePick.options[i].value == gameNumber){
                        fail = true;
                        showMessage("ERROR: Specified gamestate file already exists", "error");
                        break;
                    }
                }
            }
            //Call the function to make the XML data
            makeXML(gameNumber, gameState, true);
        }
        //Overwrite an existing gamestate
        else if (saveType == "overwrite"){
            gameNumber = board.game;
            //Get the state number, depending on whether
            //the save type is "newstate" or "overwrite"
            gameState = board.state;
            if (gameState > 0){
                while (gameState.length < 2){
                    gameState = "0" + gameState;
                }
                while (gameNumber.length < 4){
                    gameNumber = "0" + gameNumber;
                }
                //Verify that a user trying to save a
                //new state for an existing game is
                //the creator or an admin
                if (userLevel < 3){
                    var creatorName = board.creator;
                    if (creatorName.toLowerCase() != userName.toLowerCase()){
                        fail = true;
                        showMessage("ERROR: User name mismatch", "error");
                    }
                }
                //Call the function to make the XML data
                makeXML(gameNumber, gameState);
            }
            else {
                fail = true;
                showMessage("ERROR: No states for that game exist", "error");
            }
        }
        //Make a new save for an existing game
        else if (saveType == "newstate"){
            gameNumber = board.game;
            while (gameNumber.length < 4){
                gameNumber = "0" + gameNumber;
            }
            //Verify that a user trying to save a
            //new state for an existing game is
            //the creator or an admin
            var creatorName = board.creator;
            if (userLevel >= 3){
                //Get the state number and pass it to the
                //makeXML function
                nextState(gameNumber, makeXML);
            }
            else if (creatorName.toLowerCase() == userName.toLowerCase()){
                //Get the state number and pass it to the
                //makeXML function
                nextState(gameNumber, makeXML);
            }
            else {
                fail = true;
                showMessage("ERROR: User name mismatch", "error");
            }
        }
    }
    //Save the board state to local storage
    if (fail){
        gameNumber = gameNumber ? gameNumber : board.game;
        gameState = gameState ? gameState : board.state;
        //Take a best guess at whether to save as a new game
        var newGame = (!gameState || gameState <= 1 || !board.creator) ? true : false;
        makeXML(gameNumber, gameState, newGame, true);
    }
}

/* Check local storage to see if a game board is
 * stored, and if one is, restore it.
 */
function checkLocalStorage(){
    var xmlDoc, root;
    var board = document.getElementById("board");
    //Check for a board in local storage
    if (typeof(localStorage["gameboard"]) == "string"){
        //If the parser can be found, load
        //the locally stored board
        if (board.parser){
            xmlDoc = board.parser.readXML(unescape(localStorage["gameboard"].replace(/\+/g, " ")));
            //Make sure the game can be read
            root = xmlDoc.getElementsByTagName("boardstate")[0];
            if (root && root.getAttribute){
                //Clear out the local copy
                delete localStorage["gameboard"];
                board.creator = root.getAttribute("creator");
                //Return the board
                return xmlDoc;
            }
        }
    }
    //Return false if no board was found, or
    //if it could not be loaded for some reason
    return false;
}

/* Flag the board as saved or unsaved, and display a
 * warning the first time a move is made when the
 * user isn't logged in
 */
function unsavedBoard(saved, stifle){
    var buttons = document.getElementsByClassName("warn");
    var board = document.getElementById("board");
    var userLevel = document.getElementById("userlevel").value;
    var status = saved ? "off" : "on";
    for (var i = 0; i < buttons.length; i++){
        toggleClass("unsaved", buttons[i], status);
    }
    board.saved = saved ? true : false;
    //Show the warning message
    if (!(userLevel > 0 || board.gaveNotice || saved || stifle)){
        showMessage("Warning: You are not logged in, and will not be able to save your changes.", "warning");
        board.gaveNotice = true;
    }
}

/* Display error or status messages.
 */
function showMessage(content, type){
    var $message = $("#message");
    var $frame = $message.children().first();
    var $messageContent = $("#messagecontent");
    //Set the message type
    if (type == "okay"){
        $frame.attr("class", "okay");
    }
    else if (type == "warning"){
        $frame.attr("class", "warning");
    }
    else if (type == "error"){
        $frame.attr("class", "error");
    }
    //Set the message content
    var text = document.createTextNode(content);
    $messageContent.append(text);
    //Set the top margin based on the
    //message height;
    var styles = getComputedStyle($frame[0], null) || $frame[0].currentStyle;
    var height = Number(styles.height.replace(/[^0-9.]/g,""));
    var border = Number(styles.borderTopWidth.replace(/[^0-9.]/g,""));
    var margin = Number(styles.marginTop.replace(/[^0-9.]/g,""));
    var padding = Number(styles.paddingTop.replace(/[^0-9.]/g,""));
    var topMargin = Math.floor(height / 2) + border + margin + padding;
    $frame.css("margin-top", "-" + topMargin + "px");
    //Move the message div to the front
    $message.toggleClass("z5", true);
    //Set a handler to clear the message
    $(document).click(hideMessage);
}

/* Prompt the user for a yes/no or
 * multiple-choice response. The possible
 * responses should be in an array.  The
 * function "responder" is called when a
 * button is pressed.
 */
function showPrompt(content, options, responder){
    var message = document.getElementById("message");
    var frame = message.firstElementChild;
    var messageContent = document.getElementById("messagecontent");
    var buttonBox = document.getElementById("messagebuttons");
    frame.className = "question";
    //Set the message content
    var text = document.createTextNode(content);
    messageContent.appendChild(text);
    //Add the buttons
    var i, button;
    var buttonList = [];
    for (i = 0; i < options.length; i++){
        button = document.createElement("input");
        buttonList.push(button);
        button.type = "button";
        button.value = options[i];
        button.responder = responder;
        button.list = buttonList;
        //Make sure no sticky circular references
        //or closures get left behind
        button.destructor = function(){
            delete this.onclick;
            delete this.responder;
            this.parentNode.removeChild(this);
        };
        button.onclick = function(){
            this.responder();
            while (this.list.length > 0){
                this.list.pop().destructor();
            }
            hideMessage();
        };
        buttonBox.appendChild(button);
    }
    //Set the top margin based on the
    //message height;
    var styles = getComputedStyle(frame, null) || frame.currentStyle;
    var height = Number(styles.height.replace(/[^0-9.]/g,""));
    var border = Number(styles.borderTopWidth.replace(/[^0-9.]/g,""));
    var margin = Number(styles.marginTop.replace(/[^0-9.]/g,""));
    var padding = Number(styles.paddingTop.replace(/[^0-9.]/g,""));
    var topMargin = Math.floor(height / 2) + border + margin + padding;
    frame.style.marginTop = "-" + topMargin + "px";
    //Move the message div to the front
    toggleClass("z5", message, "on");
}

/* Hide the message box.
 */
function hideMessage(){
    var $message = $("#message");
    var $frame = $message.children().first();
    var $messageContent = $("#messagecontent");
    //Reset everything
    $frame.removeClass();
    $messageContent.children().remove();
    $frame.css("margin-top", "0px");
    $message.toggleClass("z5", false);
    //Remove the handler
    $(document).unbind('click', hideMessage);
}

/* Set up the board.
 */
function initialize(){
    var $board = $("#board"),
        board = $board[0],
        $body = $("#body");
    //Set up the various controls and
    //components, and draw the initial board
    if (board.getContext){
        //Assign the board parser (for
        //a board in local storage)
        board.parser = xmlParser();
        //Set handlers for the dropdown lists
        var $gamePick = $("#gamepick");
        var $statePick = $("#statepick");
        $gamePick.change(getStates);
        var prohibitLocal = $("#localreferer").val() == 'true';
        $("#drawnow").click(function(){
            //Reload the page with the requested data
            var game = Number($gamePick[0].options[$gamePick[0].selectedIndex].value);
            var state = Number($statePick[0].options[$statePick[0].selectedIndex].value);
            window.location = "gameboard.php?game=" + game + "&state=" + state;
        });
        //Set up the save game/state buttons
        $("#savexmlstate").click(function(){
            saveBoardXML("newstate");
        });
        $("#savexmlgame").click(function(){
            saveBoardXML("newgame");
        });
        $("#overwritestate").click(function(){
            saveBoardXML("overwrite");
        });
        //Set up the holding pen for
        //object drag-and-drop
        var $pen = $(document.createElement("div"));
        $pen.addClass("holding");
        $pen.attr("id", "pen");
        $body.append($pen);
        //Check for a board in local storage,
        //and restore it if one is found unless
        //we got here from another board.
        if (checkCompatibility().localStorage && !prohibitLocal){
            var localBoard = checkLocalStorage();
        }
        //Draw the starting board (either the locally
        //stored board, or the selected saved one)
        drawBoard(false, localBoard);
        //Set up the list of Chaos cards
        var $cchead = $("#cchead");
        $cchead[0].items = $("#cc0")[0];
        $cchead[0].items2 =  $("#cc1")[0];
        $cchead[0].open = clickOpen;
        $cchead[0].close = clickClosed;
        $cchead.mousedown($cchead[0].open);
        //Set up the list of Old World cards
        var $owchead = $("#owchead");
        $owchead[0].items =  $("#owc")[0];
        $owchead[0].open = clickOpen;
        $owchead[0].close = clickClosed;
        $owchead.mousedown($owchead[0].open);
        //Draw the remaining Old World tokens
        var $owthead = $("#owthead");
        $owthead[0].items =  $("#owt")[0];
        $owthead[0].open = clickOpen;
        $owthead[0].close = clickClosed;
        $owthead.mousedown($owthead[0].open);
        //Set relations so that the reserve
        //drawers can close each other
        $cchead[0].next = $owchead[0];
        $owchead[0].next = $owthead[0];
        $owthead[0].next = $cchead[0];
        //Set up the save PNG button
        var $savePNG = $("#savepng");
        $savePNG.click(function(){
            var canvasData = $board[0].toDataURL("image/png");
            $.post('savepng.php', { canvas: canvasData }, function(){
                var board = $("#board")[0];
                window.open("getmap.php?game=" + board.game + "&state=" + board.state, "_self");
            });
        });
    }
}
