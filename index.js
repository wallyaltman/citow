/**
 * http://www.appliednerditry.com/chaos/index.js
 * Created Tue 24 May 2011 21:30:28 EDT
 * Requires: jQuery
 */

function Index(){

    /*** Private ***/
    
    var textGameNumber = $("#gamenumber");
    
    var textPlayerNames = $([name^="player_"]);
    
    var radioOfficialGame = $("#officialgame");
    var radioOtherGame = $("#othergame");
    
    var checkIcon = $("#check");
    
    var errorIcon = $("#error");

    /**
     * TODO: Set checkboxes to enable/disable name
     * entry fields and set/clear placeholder text.
     */

    var hookCheckboxes = function(){
        $(input[type="checkbox"]).click(function(){
            var textField = $( );

        });

    };
    
    /**
     * Determine whether the game number falls within
     * the allowable range, and is still available.
     */
    
    var checkGameNumber = function(){
        var dfd = new $.Deferred();
        var official = radioOfficialGame.prop("checked");
        var gameNum = textGameNumber.attr("value");
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
                errorIcon.hide();
                checkIcon.show();
            }
            else {
                checkIcon.hide();
                errorIcon.show();
            }
        });
    };
    
    /**
     * Set handlers on the input field and
     * the radio buttons.
     */
     
    textGameNumber.change(updateGameNumberIcons);
    radioOfficialGame.change(updateGameNumberIcons);
    radioOtherGame.change(updateGameNumberIcons);
}

$(document).ready(function(){
    INDEX = new Index();
});

