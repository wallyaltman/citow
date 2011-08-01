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

    /**
     * Disable the "player name" text input field for
     * a ruinous power.
     */
    var disableTextInput = function(){
        var $nameField = $("#player_" + this.id);
        $nameField.prop("disabled", true);
        $nameField.attr("placeholder", "");
        $(this).unbind("change");
        $(this).change(enableTextInput);
    };

    /**
     * Enable the "player name" text input field for
     * a ruinous power.
     */
    var enableTextInput = function(){
        var $nameField = $("#player_" + this.id);
        var labelName = $('[for="' + this.id + '"]').text().replace(/^the\s*/i, "");
        $nameField.prop("disabled", false);
        $nameField.attr("placeholder", "Name of the " + labelName + " player");
        $(this).unbind("change");
        $(this).change(disableTextInput);
    };

    /**
     * Determine whether the game number falls within
     * the allowable range, and is still available.
     */

    var checkGameNumber = function(){
        var dfd = new $.Deferred();
        var official = $radioOfficialGame.prop("checked");
        var gameNum = $textGameNumber.attr("value");
        var min = official ? 28 : 1001; //Development began around Game 28 or so
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
     * entry fields and set/clear placeholder text.
     */

    $('input[type="checkbox"]').each(function(){
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

