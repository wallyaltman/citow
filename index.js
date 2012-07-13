/**
 * http://www.appliednerditry.com/chaos/index.js
 * Created Tue 24 May 2011 21:30:28 EDT
 * Requires: jQuery
 */

function Index(){

    /*** Private ***/

    var $textGameNumber = $("#gamenumber");

    var $textPlayerNames = $('[name^="player_"]');

    var $radioOfficialGame = $("#officialgame");
    var $radioOtherGame = $("#othergame");

    var $urlGameThread = $("#pathread");
    var $hiddenGameThread = $("#threadnum");

    var $checkIconGame = $("#checkgame");
    var $errorIconGame = $("#errorgame");

    var $checkIconThread = $("#checkthread");
    var $errorIconThread = $("#errorthread");

    var $playerCheckboxes = $('fieldset#powers input[type="checkbox"]');
    var $tooManyPlayersMessage = $("p#toomanyplayers");

    /**
     * Disable the "player name" text input field for
     * a ruinous power, and check the player counts.
     */
    var disableTextInput = function(){
        var $nameField = $("#player_" + this.id);
        $nameField.prop("disabled", true);
        $nameField.attr("placeholder", "");
        showOrHidePlayerCountError();
        $(this).unbind("change");
        $(this).change(enableTextInput);
    };

    /**
     * Enable the "player name" text input field for
     * a ruinous power, and check the player counts.
     */
    var enableTextInput = function(){
        var $nameField = $("#player_" + this.id);
        var labelName = $('[for="' + this.id + '"]').text().replace(/^the\s*/i, "");
        $nameField.prop("disabled", false);
        $nameField.attr("placeholder", "Name of the " + labelName + " player");
        showOrHidePlayerCountError();
        $(this).unbind("change");
        $(this).change(disableTextInput);
    };

    /**
     * Determine whether too many players are selected.
     */
    var tooManyPlayers = function(){
        var playerCount = $playerCheckboxes.filter(':checked').length;
        return playerCount > 5;
    }

    /**
     * Show or hide an error message, based on whether too
     * many players are selected.
     */
    var showOrHidePlayerCountError = function(){
        if (tooManyPlayers()){
            $tooManyPlayersMessage.removeClass('hide-contents');
        } else {
            $tooManyPlayersMessage.addClass('hide-contents');
        }
    }

    /**
     * Determine whether the game number falls within
     * the allowable range, and is still available.
     */

    var checkGameNumber = function(){
        var dfd = new $.Deferred();
        var gameNum = $textGameNumber.attr("value");
        var min = 1
        if (gameNum < min){
            return false;
        }
        //If the number isn't too low, pull the game
        //roster and look for the game number there
        $.getJSON("saves/owned_games.json", function(gameList){
            dfd.resolve(!gameList.hasOwnProperty(gameNum));
        });
        return dfd.promise();
    };

    /**
     * Update the icons to reflect the validity of
     * the game number.
     */

    var updateGameNumberIcons = function(){
        $.when(checkGameNumber()).then(function(okay){
            if (okay){
                $errorIconGame.hide();
                $checkIconGame.show();
            }
            else {
                $checkIconGame.hide();
                $errorIconGame.show();
            }
        });
    };

    /**
     * Check whether a forum thread can be identified
     * from a given URL or thread number.
     */

    var validateGameURL = function(){
        var dfd = new $.Deferred();
        var url = $urlGameThread.attr("value");
        //Old forum links:
        //Capture groups: /------------------------------1------------------------------\              /--4--\
        var pattern = /^((?:http:\/\/)?forums.penny-arcade.com\/show(thread|post)\.php\?)?(?:(t|p)=)?(\d{6,9})/i;
        //Capture groups:                                            \----2----/           \---3--/
        //New forum links:
        //Capture groups:   /-------------------------1-------------------------\   /--3--\
        var newPattern = /^((?:http:\/\/)?forums.penny-arcade.com\/(discussion)\/)?(\d{6,9})/i;
        //Capture groups:                                           \----2---/
        //Match the regular expression
        var matches = url.match(pattern);
        //Check for a valid forum thread
        if (matches) {
            if (matches[3] === "p") {
                //If given a URL with post number, grab the thread, find
                //the thread number, and return it
                $.get("readthread.php", { p: matches[4] }, function(threadNum) {
                    $hiddenGameThread.prop("value", threadNum);
                    dfd.resolve(threadNum);
                }, "json");
            } else if (!isNaN(matches[4])) {
                //If given a URL with thread number, or just a number, simply
                //try to GET the page, and return the number on success
                $.get("readthread.php", { t: matches[4] }, function(threadNum) {
                    $hiddenGameThread.prop("value", threadNum);
                    dfd.resolve(threadNum);
                }, "json");
            } else {
                return false;
            }
        } else {
            matches = url.match(newPattern);
            if (matches) {
                return matches[3];
            } else {
                return false;
            }
        }
        return dfd.promise();
    }

    /**
     * Update the icon to indicate whether a forum thread
     * could be identified from the URL field.
     */

    var updateGameURLIcon = function(){
        $.when(validateGameURL()).then(function(threadNum){
            if (!isNaN(threadNum) && threadNum > 0) {
                $errorIconThread.hide();
                $checkIconThread.show();
            }
            else {
                $checkIconThread.hide();
                $errorIconThread.show();
            }
        });
    }
    /**
     * Set handlers on checkboxes to enable/disable name
     * entry fields, set/clear placeholder text, and show or
     * hide an error message for too many players.
     */

    $playerCheckboxes.each(function(){
        var checked = $(this).prop("checked");
        if (checked){
            $(this).change(disableTextInput);
        }
        else {
            $(this).change(enableTextInput);
        }
    });

    /**
     * Set handlers on the number input field
     * and the radio buttons.
     */

    $textGameNumber.change(updateGameNumberIcons);
    $radioOfficialGame.change(updateGameNumberIcons);
    $radioOtherGame.change(updateGameNumberIcons);

    /**
     * Set handlers on the URL input field.
     */

    $urlGameThread.change(updateGameURLIcon);
}

$(document).ready(function(){
    INDEX = new Index();
});

