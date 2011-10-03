/* http://appliednerditry.com/chaos/citow_draw.js
 * This file contains board-drawing functions
 * for Chaos in the Old World.
 * Created 13 Dec 2010
 */

/* Draw an Old World card or a
 * Chaos card or card slot.
 */
function drawCard(x, y, ctx){
    var card = this;
    var x1 = x + 7;
    var y1 = y;
    var width = 170;
    var highlight, shadow, color1, color2;
    ctx.textBaseline = "bottom";
    //Draw a backdrop so that nothing shows
    //through the gaps when a card is moved
    if (card.type === "chaos"){
        ctx.fillStyle = card.bgcolor2;
    }
    else if (card.type === "oldworld"){
        ctx.fillStyle = "#000000";
    }
    ctx.fillRect(x1, y1, width, 16);
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.65);
    ctx.bezierCurveTo(x1 - 7, y1 + 0.65, x1 - 7, y1 + 16.35, x1 + 0.5, y1 + 16.35);
    ctx.fill();
    //Draw the straight-line borders
    ctx.strokeStyle = "#B0B0B0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1 + 0.5);
    ctx.lineTo(x1 + width, y1 + 0.5);
    ctx.moveTo(x1, y1 + 16.5);
    ctx.lineTo(x1 + width, y1 + 16.5);
    //Draw two left-end cells for
    //Chaos cards
    if (card.type === "chaos"){
        ctx.moveTo(x1 + 6.5, y1);
        ctx.lineTo(x1 + 6.5, y1 + 16);
        ctx.moveTo(x1 + 18.5, y1);
        ctx.lineTo(x1 + 18.5, y1 + 16);
    }
    //Draw one left-end cell for
    //Old World cards
    else if (card.type === "oldworld"){
        ctx.moveTo(x1 + 9.5, y1);
        ctx.lineTo(x1 + 9.5, y1 + 16);
    }
    ctx.moveTo(x1 + width - 0.5, y1);
    ctx.lineTo(x1 + width - 0.5, y1 + 16);
    ctx.stroke();
    //Draw the curved endcap
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.65);
    ctx.bezierCurveTo(x1 - 7, y1 + 0.65, x1 - 7, y1 + 16.35, x1 + 0.5, y1 + 16.35);
    ctx.stroke();
    //Draw the fill for a Chaos card
    if (card.type === "chaos"){
        //Check for card data
        highlight = !card.placeholder ? (card.owner ? card.owner.highlight : "#CCA477") : null;
        shadow = !card.placeholder ? (card.owner ? card.owner.shadow : "#3D3322") : null;
        //Draw the fill
        ctx.fillStyle = shadow || card.bgcolor;
        ctx.fillRect(x1 + 8, y1 + 2, 9, 13);
        ctx.fillRect(x1 + 20, y1 + 2, width - 21, 13);
        ctx.fillRect(x1, y1 + 2, 5, 13);
    }
    //Draw the fill for an Old World card
    else if (card.type === "oldworld"){
        color1 = "#B0B0B0";
        color2 = "#595959";
        ctx.fillStyle = "#111111";
        ctx.fillRect(x1, y1 + 2, 8, 13);
        ctx.fillRect(x1 + 11, y1 + 2, width - 12, 13);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1 + 2);
    ctx.bezierCurveTo(x1 - 4, y1 + 4, x1 - 4, y1 + 13, x1, y1 + 15);
    ctx.closePath();
    ctx.fill();
    //Write the card info
    if (!card.placeholder){
        //Set the card's bounding box
        card.x0 = x;
        card.x1 = x + width + 8;
        card.y0 = y;
        card.y1 = y + 17;
        ctx.font = "12px Tahoma, Helvetica, sans-serif";
        //Write the Chaos card details
        if (card.type === "chaos"){
            ctx.fillStyle = highlight;
            ctx.fillText(card.cost, x1 - 2, y1 + 15);
            ctx.fillText(card.name, x1 + 20, y1 + 15);
            if (card.magic){
                card.magicIcon.draw(x1 + 8, y1 + 4, ctx);
            }
        }
        //Write the Old World card details
        else if (card.type === "oldworld"){
            ctx.fillStyle = (card.active) ? color1 : color2;
            ctx.fillText(card.name, x1 + 11, y1 + 15);
            if (card.event){
                if (card.active){
                    card.symbol.ctx = ctx;
                    card.symbol.draw(x1 - 2, y1 + 3, ctx);
                }
                else {
                    card.symbol2.draw(x1 - 2, y1 + 3, ctx);
                }
            }
        }
    }
    //Draw figures held on the card
    if (this.slot && this.slot.figures.length > 0) {
        //Count the figures of each type to
        //determine the space required
        var space = 0;
        for (j = 0; j < this.slot.figures.length; j++){
            if (this.slot.figures[j].model === "cultist"){
                space += 9;
            }
            else if (this.slot.figures[j].model === "warrior"){
                space += 12;
            }
            else {
                space += 16;
            }
        }
        var figure;
        var y2 = y1 + 16;
        //Set the starting position for figure drawing
        x1 = x1 + width - space - 2;
        players = $("#board")[0].map.players;
        for (j = 0; j < players.length; j++){
            playerName = players[j].name;
            for (k = 0; k < this.slot.figures.length; k++){
                figure = this.slot.figures[k];
                if (playerName === figure.owner.name){
                    x1 = figure.draw(x1, y2, ctx);
                }
            }
        }
        ctx.restore();
    }
    if (this.slot) {
        //Set the slot's bounding box (same as the card)
        this.slot.x0 = x;
        this.slot.x1 = x + width + 8;
        this.slot.y0 = y;
        this.slot.y1 = y + 17;
    }
}

/* Draw a cultist, warrior, or daemon figure, and return
 * the x-coordinate for drawing the next figure.
 */
function drawFigure(x0, y0, ctx, transform){
    var highlight = this.owner.highlight;
    var shadow = this.owner.shadow;
    var x1, y1, x2, x3, y3, r1, r2, r3, x4, y4;
    //Scale the figure
    if (this.model === "cultist"){
        r1 = 3.5;
    }
    else if (this.model === "warrior"){
        r1 = 5.5;
    }
    else if (this.model === "daemon"){
        r1 = 7.5;
    }
    x1 = x0 + r1 - 0.5;
    y1 = y0 - (3 * r1);
    x2 = x0 + (2 * r1);
    r3 = r1 / 2;
    x3 = x1 - (r1 - r3) / 2;
    y3 = y1 - (r1 - r3) / 2;
    var linGrad, radGrad;
    //Draw the Soporific Musk effect, if needed
    if (this.musk){
        var darkPurple = "#351044";
        var lightPurple = "#AD20E5";
        ctx.save();
        ctx.translate(x1, y1);
        ctx.scale(1, 1.4);
        radGrad = ctx.createRadialGradient(0, 2, r1 - 1, 0, -1 * r1 + 1, 2 * (r1 + 1));
        radGrad.addColorStop(0.01, darkPurple);
        radGrad.addColorStop(0.15, darkPurple);
        radGrad.addColorStop(0.42, lightPurple);
        radGrad.addColorStop(0.65, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(-2 * (r1 + 2), -2 * (r1 + 2) + 1, 4 * r1 + 7, 4 * r1 + 7);
        ctx.restore();
    }
    //Draw the body
    linGrad = ctx.createLinearGradient(x0, y0 - r3, x2, y0);
    linGrad.addColorStop(0, highlight);
    linGrad.addColorStop(1, shadow);
    ctx.fillStyle = linGrad;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y3);
    ctx.lineTo(x2, y0);
    ctx.closePath();
    ctx.fill();
    //Draw the head
    radGrad = ctx.createRadialGradient(x3, y3, r3, x1, y1, r1);
    radGrad.addColorStop(0.01, highlight);
    radGrad.addColorStop(0.05, highlight);
    radGrad.addColorStop(0.95, shadow);
    radGrad.addColorStop(0.97, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGrad;
    ctx.fillRect(x0 - 1, y1 - r1 - 2, 2 * (r1 + 1), 2 * (r1 + 2));
    //Draw the horns, if the figure
    //is a daemon
    if (this.model === "daemon"){
        linGrad = ctx.createLinearGradient(x1, y1 - r1 - 2, x1 + 1, y1 + r1 + 2);
        linGrad.addColorStop(0, highlight);
        linGrad.addColorStop(1, shadow);
        ctx.fillStyle = linGrad;
        ctx.beginPath();
        ctx.moveTo(x1 - r1, y1);
        ctx.bezierCurveTo(x1 - r1 - 3, y1 - 3, x1 - r1 - 2, y1 - 6, x1 - r1 + 2, y1 - r1 - 2);
        ctx.bezierCurveTo(x1 - r1, y1 - 5, x1 - r1 + 0.5, y1 - 3, x1 - 4.8, y1 - 4.8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x1 + r1, y1);
        ctx.bezierCurveTo(x1 + r1 + 3, y1 - 3, x1 + r1 + 2, y1 - 6, x1 + r1 - 2, y1 - r1 - 2);
        ctx.bezierCurveTo(x1 + r1, y1 - 5, x1 + r1 - 0.5, y1 - 3, x1 + 4.8, y1 - 4.8);
        ctx.closePath();
        ctx.fill();
    }
    //Draw effects, if needed
    //Warp Shield
    if (this.shield){
        ctx.lineWidth = 1;
        x4 = Math.floor(x1) - 0.5;
        y4 = Math.floor(y0 - (2 * r1)) - 0.5;
        linGrad = ctx.createLinearGradient(x4, y4, x4 + 5, y4 + 2);
        linGrad.addColorStop(0.1, "#0F1C38");
        linGrad.addColorStop(0.5, "#0065FF");
        linGrad.addColorStop(0.9, "#0F1C38");
        ctx.fillStyle = linGrad;
        ctx.strokeStyle = "#A0A0A0";
        ctx.beginPath();
        ctx.moveTo(x4, y4);
        ctx.lineTo(x4, y4 + 4);
        ctx.lineTo(x4 + 2.5, y4 + 6);
        ctx.lineTo(x4 + 5, y4 + 4);
        ctx.lineTo(x4 + 5, y4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    //Nurgle's Leper upgrade
    if (this.marker){
        ctx.lineWidth = 1.5;
        x4 = Math.floor(x1) - 1.5;
        y4 = Math.floor(y0 - r1 + 0.5);
        ctx.strokeStyle = "#202020";
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(x4, y4, 2, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = shadow;
        ctx.beginPath();
        ctx.arc(x4, y4, 0.5, 0, 2 * Math.PI, true);
    }
    //Skull marker
    if (this.skull) {
        x4 = Math.floor(x1 - ((r1 + 0.5)/ 2) - 4);
        y4 = Math.floor(y0 - 8);
        board.skullIcon.draw(x4, y4, ctx);
    }
    //Store the figure's bounding box, accounting for
    //any transformations
    if (!transform){
        this.x0 = x0;
        this.y0 = Math.floor(y0 - (4 * r1));
        this.x1 = Math.floor(x2 + 1);
        this.y1 = y0 + 1;
    }
    else {
        this.x0 = x0 + transform.x;
        this.y0 = y0 + transform.y - Math.floor((4 * r1) / transform.factor);
        this.x1 = x0 + transform.x + Math.floor((x2 - x0 + 1) / transform.factor);
        this.y1 = y0 + transform.y + 1;
    }
    //Return the horizontal position to start
    //drawing the next figure
    return x2 + 2;
}

/* Draw a token at the specified coordinates.
 */
function drawToken(x, y, ctx){
    var token = this;
    var board, allUpgrades, allIcons, pos, number;
    var icon, sz19;
    //This method draws the token, and will
    //replace the drawToken function in
    //subsequent calls to the draw() method
    //on the current token
    var drawIcon = function(x, y, ctx){
        var dimX = this.icon.width;
        var dimY = this.icon.height;
        //Draw the image by pulling the target
        //rectangle off the sprite sheet
        ctx.drawImage(this.icon.img, this.icon.srcX, this.icon.srcY, dimX, dimY, x, y, dimX, dimY);
        //Store the token's bounding box
        this.x0 = x;
        this.y0 = y;
        this.x1 = x + dimX;
        this.y1 = y + dimY;
    };

    //This is a special method, used only
    //for icons drawn with an alpha value
    var drawIconAlpha = function(x, y, ctx){
        var dimX = this.icon.width;
        var dimY = this.icon.height;
        //Set the alpha value
        ctx.globalAlpha = this.icon.alpha;
        //Draw the image by pulling the target
        //rectangle off the sprite sheet
        ctx.drawImage(this.icon.img, this.icon.srcX, this.icon.srcY, dimX, dimY, x, y, dimX, dimY);
        //Store the token's bounding box
        this.x0 = x;
        this.y0 = y;
        this.x1 = x + dimX;
        this.y1 = y + dimY;
        //Reset the alpha value
        ctx.globalAlpha = 1;
    };

    //This method is for drawing upgrades
    //(which have uniform dimensions, and 
    //carry their own coordinate data)
    var drawUpgrade = function(x, y, ctx){
        var img = board.upgradeSprites;
        var dimX = 23;
        var dimY = 19;
        //Draw the image by pulling the target
        //rectangle off the sprite sheet
        ctx.drawImage(img, this.srcX, this.srcY, dimX, dimY, x, y, dimX, dimY);
        //Store the token's bounding box
        this.x0 = x;
        this.y0 = y;
        this.x1 = x + dimX;
        this.y1 = y + dimY;
    };

    board = document.getElementById("board");
    //Create a list of icons other than upgrades
    allIcons = ["event", "hero", "noble", "peasant", "skaven", "warpstone", "dac",
                "select", "unselect", "smallcomet", "darkcomet", "magic", "skull"];
    //Check whether this is an icon or upgrade,
    //and proceed accordingly
    if (allIcons.indexOf(this.name) >= 0){
        //Set the icon association if
        //it is not yet set
        if (!this.icon){
            //If this is the very first icon to
            //be drawn, retrieve the sprite sheet
            //and set up the icon array
            if (!board.iconSprites){
                board.iconSprites = document.createElement('img');
                board.iconSprites.src = "icons/icon_sprites.png";
                board.iconList = {};
            }
            //If this is the first instance of this
            //specific icon to be drawn, set up the
            //drawing information and load the icon
            //into the array
            if (!board.iconList.hasOwnProperty(this.name)){
                //Starting (upper-left) coordinate positions for
                //the tokens, in order (from the list above)
                pos = [{x:1,y:1}, {x:21,y:1}, {x:41,y:1}, {x:1,y:21}, {x:21,y:21}, {x:41,y:21}, {x:73,y:21},
                       {x:61,y:3}, {x:77,y:3}, {x:61,y:19}, {x:61,y:19}, {x:61,y:31}, {x:93,y:33}];
                //Get the index of the current icon with respect
                //to the icon list
                number = allIcons.indexOf(this.name);
                icon = {
                    img : board.iconSprites,   //The icon sheet
                    srcX : pos[number].x,       //X-coord on the sheet
                    srcY : pos[number].y        //Y-coord on the sheet
                };
                //Group icons by dimensions and assign height
                //and width
                sz19 = ["dac", "event", "hero", "noble", "peasant", "skaven", "warpstone"];
                //Old World tokens & DAC
                if (sz19.indexOf(this.name) >= 0){
                    icon.width = 19;
                    icon.height = 19;
                }
                //Toggle switch
                else if (this.name === "select" || this.name === "unselect"){
                    icon.width = 15;
                    icon.height = 15;
                }
                //Old World Card event indicators
                else if (this.name === "smallcomet" || this.name === "darkcomet"){
                    icon.width = 11;
                    icon.height = 11;
                    //The "darkcomet" should be drawn semi-transparent, by
                    //setting the global alpha value
                    if (this.name === "darkcomet"){
                        icon.alpha = 0.4;
                    }
                }
                //Chaos Card magic symbol
                else if (this.name === "magic"){
                    icon.width = 9;
                    icon.height = 9;
                }
                else if (this.name === "skull") {
                    icon.width = 7;
                    icon.height = 7;
                }
                //Insert the icon in the list
                board.iconList[this.name] = icon;
            }
            //Create a reference on the token
            //to its icon
            this.icon = board.iconList[this.name];
        }
        //If the sprite sheet is loaded already,
        //go ahead and reassign the method and
        //draw the token
        if (this.icon.img.complete){
            //Set the "alpha" method if needed
            if (this.icon.alpha && this.icon.alpha !== 1){
                this.draw = drawIconAlpha;
            }
            else {
                this.draw = drawIcon;
            }
            this.draw(x, y, ctx);
        }
        //Otherwise, set an interval that will
        //complete those tasks once the sheet
        //has been loaded
        else {
            var loadTimer;
            //Set the "alpha" method if needed. The 
            //check is run now, rather than running
            //it repeatedly in the timer.
            if (this.icon.alpha && this.icon.alpha !== 1){
                loadTimer = setInterval(function(){
                    if (token.icon.img.complete){
                        clearInterval(loadTimer);
                        token.draw = drawIconAlpha;
                        token.draw(x, y, ctx);
                    }
                }, 100);
            }
            else {
                loadTimer = setInterval(function(){
                    if (token.icon.img.complete){
                        clearInterval(loadTimer);
                        token.draw = drawIcon;
                        token.draw(x, y, ctx);
                    }
                }, 100);
            }
        }
    }
    else {
        //If this is the very first upgrade
        //to be drawn, retrieve the sprite sheet
        if (!board.upgradeSprites){
            board.upgradeSprites = document.createElement('img');
            board.upgradeSprites.src = "icons/" + board.upgradeSheet;
        }
        //If the sprite sheet is loaded already,
        //go ahead and reassign the method and
        //draw the token
        if (board.upgradeSprites.complete){
            this.draw = drawUpgrade;
            this.draw(x, y, ctx);
        }
        //Otherwise, set an interval that will
        //complete those tasks once the sheet
        //has been loaded
        else {
            loadTimer = setInterval(function(){
                if (board.upgradeSprites.complete){
                    clearInterval(loadTimer);
                    token.draw = drawUpgrade;
                    token.draw(x, y, ctx);
                }
            }, 100);
        }
    }
}

 /* Draw a subset of the reserve pool
 * of OldWorld tokens.
 */
function drawOldWorldTokens(){
    var tokens = this.tokens;
    var ctx = this.ctx;
    var x, i;
    var y = this.y0;
    var width = this.x1 - this.x0;
    var height = this.y1 - this.y0;
    ctx.clearRect(this.x0, this.y0, width, height);
    for (i = 0; i < tokens.length; i++){
        x = this.x0 + 25 * (i % 7);
        if (i === 7 || i === 14){
            y += 25;
        }
        tokens[i].draw(x, y, ctx);
    }
}

/* Draw the slide-out Old World card
 * activation selector
 */
function drawOldWorldActive(noRedraw){
    var slider = this;
    var i, toggle;
    //Clear the previous controls
    while (slider.childNodes.length > 0){
        slider.removeChild(slider.lastChild);
    }
    //Draw controls for each card
    for (i = 0; i < this.cards.length; i++){
        toggle = createToggleSwitch(this.cards[i], this.oldWorld, true);
        slider.appendChild(toggle);
    }
    //Redraw the Old World track, unless that
    //function called this one
    if (!noRedraw){
        this.oldWorld.draw(true);
    }
}

/* Draw a region, with the upper-left corner at the
 * specified coordinates.
 */
function drawRegion(){
    var ctx = this.ctx;
    var players = this.players;
    var map = this.map;
    var i, j, k, l;
    var board = $("#board")[0];
    ctx.textBaseline = "bottom";
    ctx.strokeStyle = "rgba(172, 49, 16, 1)";
    ctx.lineWidth = 1;
    ctx.lineJoin = 'miter';
    var width = 240;
    var height = 110;
    var x = 10 + (this.border.col * (width + 10));
    var y = 10 + (this.border.row * (height + 10));
    var xWidth = x + width;
    var x1, y1;
    //Clear the area
    ctx.fillStyle = "#332211";
    ctx.fillRect(x, y, width, height);
    //Draw the outer border
    ctx.strokeRect(x + 0.5, y + 0.5, width, height);
    //Draw connections to adjacent regions
    ctx.fillStyle = "rgba(172, 49, 16, 1)";
    var pos;
    for (i = 0; i < this.links.length; i++){
        pos = this.links[i];
        if (pos === "E"){
            ctx.fillRect(xWidth + 1, y + Math.floor(height / 2) - 4, 10, 10);
        }
        else if (pos === "NE"){
            ctx.fillRect(xWidth, y + 19, 10, 10);
        }
        else if (pos === "SE"){
            ctx.fillRect(xWidth + 1, y + height - 31, 10, 10);
        }
        else if (pos === "S"){
            ctx.fillRect(x + Math.floor(width / 2) - 4, y + height + 1, 10, 10);
        }
    }
    //Check for ruination and set background
    //colors accordingly
    var bgcolor, textcolor, bgcolor2, bgPop, textPop;
    if (this.ruined){
        bgcolor = "#111111";
        textcolor = "#606060";
        bgcolor2 = "#000000";
        bgPop = "#111111";
        textPop = "#606060";
        ctx.fillStyle = "#000000";
        ctx.fillRect(x + 1, y + 1, width - 1, height - 1);
    }
    else {
        bgcolor = "#553311";
        textcolor = "#CC7711";
        bgcolor2 = "#332211";
        bgPop = "#124445";
        textPop = "#20CBCB";
    }
    //Draw the header box borders
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 19.5);
    ctx.lineTo(xWidth, y + 19.5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 19.5, y + 1);
    ctx.lineTo(x + 19.5, y + 19);
    ctx.closePath();
    ctx.stroke();
    //Fill the header box background
    ctx.fillStyle = bgcolor;
    ctx.fillRect(x + 2, y + 2, 16, 16);
    ctx.fillRect(x + 21, y + 2, width - 22, 16);
    //Draw the "populated" indicator
    if (this.populated){
        ctx.fillStyle = bgcolor2;
        ctx.fillRect(xWidth - 28, y + 2, 27, 13);
        ctx.beginPath();
        ctx.moveTo(xWidth - 26.5, y + 1);
        ctx.lineTo(xWidth - 26.5, y + 13.5);
        ctx.lineTo(xWidth + 0.5, y + 13.5);
        ctx.stroke();
        ctx.fillStyle = bgPop;
        ctx.fillRect(xWidth - 25, y + 2, 24, 10);
        ctx.fillStyle = textPop;
        ctx.font = "bold 10px Tahoma, Helvetica, sans-serif";
        ctx.fillText("POP", xWidth - 24, y + 13);
    }
    //Write the resistance value and region name
    ctx.fillStyle = textcolor;
    ctx.font = "17px Tahoma, Helvetica, sans-serif";
    ctx.fillText(this.resistance, x + 5, y + 20);
    ctx.font = "15px Tahoma, Helvetica, sans-serif";
    ctx.fillText(this.name, x + 23, y + 19);
    //Draw the card slots, and insert the chaos
    //cards (if any), inserting empty placeholder
    //cards where needed
    var cards = this.cards;
    var blankCard, slotNum;
    while (cards.length < 2){
        blankCard = {
            placeholder : true,
            draw : drawCard,
            type : "chaos"
        };
        cards.push(blankCard);
    }
    for (i = 0; i < 2; i++){
        cards[i].bgcolor = bgcolor;
        cards[i].bgcolor2 = bgcolor2;
        cards[i].slot = this.slots[i];
        cards[i].draw(xWidth - 179, y + 22 + (18 * i), ctx);
    }
    //Draw a third card over the region name, if
    //upgrades permit
    var currentUpgrades;
    var thirdCard = false;
    for (i = 2; i < cards.length; i++){
        currentUpgrades = cards[i].owner
                                ? (cards[i].owner.upgrades
                                        ? cards[i].owner.upgrades
                                        : [])
                                : [];
        for (j = 0; j < currentUpgrades.length; j++){
            if (currentUpgrades[j].extraCard && currentUpgrades[j].active){
                thirdCard = true;
                cards[i].bgcolor = bgcolor;
                cards[i].bgcolor2 = bgcolor2;
                cards[i].slot = this.slots[2];
                cards[i].draw(xWidth - 179, y + 2, ctx);
                break;
            } else if (currentUpgrades[j].coverCard && currentUpgrades[j].active) {
                for (k = 0; k < players.length; k++) {
                    for (l = 0; l < players[k].upgrades.length; l++) {
                        if (players[k].upgrades[l].extraCard && players[k].upgrades[l].active){
                            thirdCard = true;
                            cards[i].bgcolor = bgcolor;
                            cards[i].bgcolor2 = bgcolor2;
                            cards[i].slot = this.slots[2];
                            cards[i].draw(xWidth - 179, y + 2, ctx);
                            break;
                        }
                    }
                    //Stop after three
                    if (thirdCard){
                        break;
                    }
                }
            }
        }
        //Stop after three
        if (thirdCard){
            break;
        }
    }
    //Dispose of the placeholder cards
    while (cards.length > 0 && cards[cards.length - 1].placeholder === true){
        cards.pop();
    }
    //Draw the corruption display
    ctx.strokeStyle = "#B0B0B0";
    ctx.lineWidth = 1;
    //Draw the straight-line borders
    ctx.beginPath();
    ctx.moveTo(xWidth - 130, y + 58.5);
    ctx.lineTo(xWidth - 2, y + 58.5);
    ctx.moveTo(xWidth - 130, y + 74.5);
    ctx.lineTo(xWidth - 2, y + 74.5);
    ctx.moveTo(xWidth - 2.5, y + 58);
    ctx.lineTo(xWidth - 2.5, y + 75);
    if (!this.ruined){
        ctx.moveTo(xWidth - 18.5, y + 58);
        ctx.lineTo(xWidth - 18.5, y + 75);
        ctx.moveTo(xWidth - 34.5, y + 58);
        ctx.lineTo(xWidth - 34.5, y + 75);
        ctx.moveTo(xWidth - 50.5, y + 58);
        ctx.lineTo(xWidth - 50.5, y + 75);
        ctx.moveTo(xWidth - 66.5, y + 58);
        ctx.lineTo(xWidth - 66.5, y + 75);
    }
    ctx.stroke();
    //Draw the curved endcap
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(xWidth - 129.5, y + 58.65);
    ctx.bezierCurveTo(xWidth - 136, y + 58.65, xWidth - 136, y + 74.35, xWidth - 129.5, y + 74.35);
    ctx.stroke();
    //Fill and write the corruption legend
    ctx.fillStyle = bgcolor;
    if (this.ruined){
        ctx.fillRect(xWidth - 128, y + 60, 125, 13);
    }
    else {
        ctx.fillRect(xWidth - 128, y + 60, 60, 13);
    }
    ctx.beginPath();
    ctx.moveTo(xWidth - 128, y + 60);
    ctx.bezierCurveTo(xWidth - 134, y + 62, xWidth - 134, y + 71, xWidth - 128, y + 73);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = textcolor;
    ctx.font = "12px Tahoma, Helvetica, sans-serif";
    var legend;
    if (this.ruined){
        switch (Number(this.ruined)){
        case 1:
            legend = "Ruined:1st";
            break;
        case 2:
            legend = "Ruined:2nd";
            break;
        case 3:
            legend = "Ruined:3rd";
            break;
        default:
            legend = "Ruined:" + this.ruined + "th";
        }
    }
    else {
        legend = "Corruption";
    }
    ctx.fillText(legend, xWidth - 130, y + 73);
    //Fill the corruption counters, set the
    //click areas, and insert the values
    var playerName, corruption, highlight, shadow, corruptPlayers;
    corruptPlayers = [];
    for (i = 0; i < players.length; i++){
        if (!players[i].noCorruption){
            corruptPlayers.push(players[i]);
        }
    }
    for (i = 0; i < corruptPlayers.length; i++){
        highlight = corruptPlayers[i].highlight;
        shadow = corruptPlayers[i].shadow;
        x1 = xWidth - 65 + (i * 16);
        y1 = y + 60;
        for (j = 0; j < this.corruption.length; j++){
            if (this.corruption[j].owner.name === corruptPlayers[i].name){
                corruption = this.corruption[j].value;
                corruption.x0 = x1;
                corruption.y0 = y1;
                corruption.x1 = x1 + 14;
                corruption.y1 = y1 + 14;
                break;
            }
        }
        if (!this.ruined){
            ctx.fillStyle = shadow;
            ctx.fillRect(x1, y1, 13, 13);
        }
        ctx.fillStyle = highlight;
        if (corruption < 10){
            ctx.fillText(corruption, x1 + 3, y1 + 13);
        }
        else {
            ctx.fillText(corruption, x1 - 1, y1 + 13);
        }
    }
    //Check whether the ruination card needs to be updated
    var numRuined = Math.min(board.numRuined(), 4);
    var ruinCard = board.ruination[numRuined];
    if (ruinCard !== map.ruinCard) {
        map.ruinCard = ruinCard;
        ruinCard.draw();
    }
    //Insert the old world tokens, if any
    var xArray = [2, 22, 42, 2, 22, 42, 2, 22, 42, 62, 82, 102, 122, 142];
    var yArray = [21, 21, 21, 41, 41, 41, 61, 61, 61, 61, 61, 61, 61, 61];
    for (i = 0; i < this.tokens.length; i++){
        if (i >= xArray.length){
            break;
        }
        x1 = x + xArray[i];
        y1 = y + yArray[i];
        this.tokens[i].draw(x1, y1, ctx);
    }
    //Count the figures of each type to
    //determine spacing between groups
    var space = width - 8;
    for (i = 0; i < this.figures.length; i++){
        if (this.figures[i].model === "cultist"){
            space -= 9;
        }
        else if (this.figures[i].model === "warrior"){
            space -= 12;
        }
        else {
            space -= 16;
        }
    }
    //If there's not enough space, shrink the figures
    x1 = x + 5;
    y1 = y + height - 1;
    ctx.save();
    var eachSpace, factor, transform;
    if (space < 0){
        ctx.translate(x1, y1);
        factor = (width - 8) / (width - 8 - space);
        //Keep two decimal places
        factor = Math.floor(factor * 100) / 100;
        ctx.scale(factor, factor);
        //Save the transformation, to be applied to the
        //figure's bounding box
        transform = {
            x : x1,
            y : y1,
            factor : factor
        };
        x1 = 0;
        y1 = 0;
        eachSpace = 0;
    }
    else {
        transform = false;
        eachSpace = Math.floor(space / (players.length - 1));
    }
    //Draw the figures in the region
    var figure;
    for (i = 0; i < players.length; i++){
        playerName = players[i].name;
        for (j = 0; j < this.figures.length; j++){
            figure = this.figures[j];
            if (playerName === figure.owner.name){
                x1 = figure.draw(x1, y1, ctx, transform);
            }
        }
        x1 += eachSpace;
    }
    ctx.restore();
    //Store the region's bounding box
    this.x0 = x;
    this.y0 = y;
    this.x1 = xWidth + 1;
    this.y1 = y + height + 1;
}

/* Draw the Old World card track.
 */
function drawOldWorld(noslider){
    var ctx = this.ctx;
    var x = 24;
    var y = 29;
    var width = 161;
    var x2 = x + width;
    var i;
    var color1 = "#B0B0B0";
    var color2 = "#595959";
    var bgcolor1 = "#111111";
    var bgcolor2 = "#000000";
    //Clear the drawing area
    ctx.fillStyle = "#332211";
    ctx.fillRect(x - 10, y - 24, width, 112);
    //Draw the outside border and fill
    //for the title box
    ctx.lineWidth = 1;
    ctx.strokeStyle = color1;
    ctx.fillStyle = bgcolor2;
    ctx.beginPath();
    ctx.moveTo(x2 - 0.5, y - 12.5);
    ctx.lineTo(x2 - 0.5, y + 0.5);
    ctx.lineTo(x + 0.5, y + 0.5);
    ctx.lineTo(x + 0.5, y - 12.5);
    ctx.bezierCurveTo(x + 0.5, y - 16.5, x + 2.5, y - 18.5, x + 6.5, y - 18.5);
    ctx.lineTo(x2 - 6.5, y - 18.5);
    ctx.bezierCurveTo(x2 - 2.5, y - 18.5, x2 - 0.5, y - 16.5, x2 - 0.5, y - 12.5);
    ctx.fill();
    ctx.stroke();
    //Redraw the corner curves at a
    //greater thickness
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + 0.6, y - 12.5);
    ctx.bezierCurveTo(x + 0.6, y - 16.5, x + 2.5, y - 18.4, x + 6.5, y - 18.4);
    ctx.moveTo(x2 - 6.5, y - 18.4);
    ctx.bezierCurveTo(x2 - 2.5, y - 18.4, x2 - 0.6, y - 16.5, x2 - 0.6, y - 12.5);
    ctx.stroke();
    //Draw the inset fill for
    //the title box
    ctx.fillStyle = bgcolor1;
    ctx.beginPath();
    ctx.moveTo(x2 - 2, y - 13);
    ctx.lineTo(x2 - 2, y + 3);
    ctx.lineTo(x + 2, y + 3);
    ctx.lineTo(x + 2, y - 13);
    ctx.bezierCurveTo(x + 2, y - 15.7, x + 3.3, y - 17, x + 6, y - 17);
    ctx.lineTo(x2 - 6, y - 17);
    ctx.bezierCurveTo(x2 - 3.3, y - 17, x2 - 2, y - 15.7, x2 - 2, y - 13);
    ctx.fill();
    //Write the title, centered
    ctx.fillStyle = color1;
    ctx.font = "15px Tahoma, Helvetica, sans-serif";
    var len = ctx.measureText("Old World Deck").width;
    var space = (x2 - x - len) / 2;
    ctx.fillText("Old World Deck", x + space, y - 1);
    //Draw the cards
    var cards = this.cards;
    var currentCard;
    for (i = 0; i < 7; i++){
        if (!this.cards[i]){
            currentCard = {
                placeholder : true,
                draw : drawCard,
                type : "oldworld"
            };
            cards.push(currentCard);
        }
        else {
            currentCard = cards[i];
        }
        currentCard.color1 = color1;
        currentCard.color2 = color2;
        currentCard.bgcolor1 = bgcolor1;
        currentCard.bgcolor2 = bgcolor2;
        currentCard.slot = this.slots[i];
        currentCard.draw(x - 16, y + (16 * i), ctx);
    }
    //Dispose of the placeholder cards
    while (cards.length > 0 && cards[cards.length - 1].placeholder === true){
        cards.pop();
    }
    //Draw the slide-out selector, unless the
    //slider itself called the function
    if (!noslider){
        this.slider.draw(true);
    }
    //Set the Old World track's bounding box
    this.x0 = x - 16;
    this.y0 = y - 19;
    this.x1 = x2;
    this.y1 = y + 112;
}

/**
 * Draw the currently showing ruination card.
 */
function drawRuination() {
    var ctx = this.ctx;
    var x = 195;    //Coordinates of the upper-left corner
    var y = 29;     //of the ruination card
    var width = 56;
    var lineHeight = 14;
    //Get the list of abbreviated region names
    var shortRegions = $.map(this.map.regions, function (region) {
        return region.shortName;
    });
    var bgcolor = "#1A1109";
    var textcolor = "#CC7711";
    var bordercolor = "#BB7711";
    var x1 = x;
    var y1 = y;
    var x2 = x + width;
    var y2 = y + lineHeight;
    var yTop = y - 19;
    var value, lastValue;
    var textString, count, textWidth, space;
    ctx.strokeStyle = bordercolor;
    ctx.lineWidth = 1;
    //Draw the title box
    ctx.fillStyle = bgcolor;
    ctx.font = "15px Tahoma, Helvetica, sans-serif";
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1);
    ctx.lineTo(x1 + 0.5, yTop + 6.5);
    ctx.bezierCurveTo(x1 + 0.5, yTop + 2.5, x1 + 2.5, yTop + 0.5, x1 + 6.5, yTop + 0.5);
    ctx.lineTo(x2 - 6.5, yTop + 0.5);
    ctx.bezierCurveTo(x2 - 2.5, yTop + 0.5, x2 - 0.5, yTop + 2.5, x2 - 0.5, yTop + 6.5);
    ctx.lineTo(x2 - 0.5, y1);
    ctx.fill();
    ctx.stroke();
    //Redraw the corner curves at a
    //greater thickness
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, yTop + 6.5);
    ctx.bezierCurveTo(x1 + 0.5, yTop + 2.5, x1 + 2.5, yTop + 0.5, x1 + 6.5, yTop + 0.5);
    ctx.moveTo(x2 - 6.5, yTop + 0.5);
    ctx.bezierCurveTo(x2 - 2.5, yTop + 0.5, x2 - 0.5, yTop + 2.5, x2 - 0.5, yTop + 6.5);
    ctx.stroke();
    ctx.lineWidth = 1;
    //Draw the text
    ctx.fillStyle = textcolor;
    textString = "Ruin " + String(Math.min(this.index + 1, 5));
    textWidth = ctx.measureText(textString).width;
    space = Math.floor((width - textWidth) / 2);
    ctx.fillText(textString, x1 + space, y1);
    //Draw the top cell, with the ruiners VP
    ctx.fillStyle = bgcolor;
    ctx.fillRect(x1, y1, width, lineHeight);
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y2);
    ctx.lineTo(x1 + 0.5, y1);
    ctx.moveTo(x1, y1 + 0.5);
    ctx.lineTo(x2, y1 + 0.5);
    ctx.moveTo(x2 - 0.5, y1);
    ctx.lineTo(x2 - 0.5, y2);
    ctx.moveTo(x2, y2 + 0.5);
    ctx.lineTo(x1, y2 + 0.5);
    ctx.stroke();
    //Draw the text
    ctx.fillStyle = textcolor;
    ctx.font = "12px Tahoma, Helvetica, sans-serif";
    ctx.fillText("Ruiners:", x1 + 2, y2);
    textWidth = ctx.measureText(this.ruiners).width;
    ctx.fillText(this.ruiners, x2 - (textWidth + 1), y2);
    //Increment the y-coordinates
    y1 = y2;
    y2 += lineHeight;
    //Loop through all the regions, build text strings,
    //and draw them
    $(this.regions).each(function (i) {
        value = String(this);
        if (value === lastValue && count < 2) {
            count += 1;
            textString += "," + shortRegions[i];
        } else {
            if (lastValue) {
                /** Draw the previous card entry **/
                //Draw the cell borders
                ctx.fillStyle = bgcolor;
                ctx.fillRect(x1, y1 + 1, width, lineHeight);
                ctx.beginPath();
                ctx.moveTo(x1 + 0.5, y2);
                ctx.lineTo(x1 + 0.5, y1);
                ctx.moveTo(x2 - 0.5, y1);
                ctx.lineTo(x2 - 0.5, y2);
                ctx.stroke();
                //Draw the text
                ctx.fillStyle = textcolor;
                ctx.fillText(textString, x1 + 2, y2);
                textWidth = ctx.measureText(lastValue).width;
                ctx.fillText(lastValue, x2 - (textWidth + 1), y2);
                //Increment the y-coordinates
                y1 = y2;
                y2 += lineHeight;
            }
            //Replace the text string
            count = 0;
            textString = shortRegions[i];
        }
        lastValue = value;
    });
    /** Draw the final card entry **/
    //Draw the cell borders
    ctx.fillStyle = bgcolor;
    ctx.fillRect(x1, y1, width, lineHeight);
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1);
    ctx.lineTo(x1 + 0.5, y2);
    ctx.moveTo(x1, y2 + 0.5);
    ctx.lineTo(x2, y2 + 0.5);  //Close the bottom
    ctx.moveTo(x2 - 0.5, y2);
    ctx.lineTo(x2 - 0.5, y1);
    ctx.stroke();
    //Draw the text
    ctx.fillStyle = textcolor;
    ctx.fillText(textString, x1 + 2, y2);
    textWidth = ctx.measureText(lastValue).width;
    ctx.fillText(lastValue, x2 - (textWidth + 1), y2);
}

/* Draw the scoreboard.
 */
function drawScoreBoard(){
    var players = this.players;
    var ctx = this.ctx;
    var x = 13;
    var y = 170;
    var width = 501 - x;  //not counting left caps
    var height = 26 * players.length + 1;  //not counting headers
    //Clear the drawing area;
    ctx.fillStyle = "#332211";
    ctx.fillRect(x - 10, y - 24, width + 19, height + 20);
    var bgcolor = "#553311";
    var textcolor = "#CC7711";
    var bordercolor = "#BB7711";
    var i, j, len, space;
    ctx.lineWidth = 1;
    ctx.strokeStyle = bordercolor;
    //Draw the row borders
    ctx.beginPath();
    for (i = 0; i <= players.length; i++){
        ctx.moveTo(x, y + (26 * i) + 0.5);
        ctx.lineTo(x + width, y + (26 * i) + 0.5);
    }
    ctx.moveTo(x + width - 0.5, y);
    ctx.lineTo(x + width - 0.5, y + (26 * players.length) + 1);
    ctx.stroke();
    //Draw the endcaps
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (i = 0; i < players.length; i++){
        ctx.moveTo(x, y + (26 * i) + 0.65);
        ctx.bezierCurveTo(x - 10, y + (26 * i) + 0.65, x - 10, y + (26 * (i + 1)) + 0.35, x, y + (26 * (i + 1)) + 0.35);
    }
    ctx.stroke();
    var currentPlayer, currentObj, pp, vp, dial, dialCap, dialValue, threat;
    var peasants, upgrades, dacs;
    var offset, radGrad;
    var x1, y1, x2, y2;
    //This array determines the cell widths:
    //Peasants, Upgrades, PP, VP, Threat Dial
    var startX = [65, 81, 24, 25, 207];
    //Subtract the other columns to get the width
    //of the first one (Name)
    var firstCol = width;
    for (i = 0; i < startX.length; i++){
        firstCol -= startX[i];
    }
    startX.unshift(firstCol);
    //Draw and fill the rows and cell dividers
    ctx.lineWidth = 1;
    ctx.font = "17px Tahoma, Helvetica, sans-serif";
    var obj, count, printName;
    var widthAdj = width + x - 2;
    for (i = 0; i < players.length; i++){
        y1 = y + (26 * i);
        currentPlayer = players[i];
        highlight = currentPlayer.highlight;
        shadow = currentPlayer.shadow;
        //Player name
        x1 = x;
        x2 = x + startX[0];
        ctx.fillStyle = shadow;
        ctx.fillRect(x1 + 1, y1 + 2, (x2 - x1 - 4), 23);
        ctx.beginPath();
        ctx.moveTo(x1 + 1, y1 + 2);
        ctx.bezierCurveTo(x1 - 7.4, y1 + 3, x1 - 7.4, y1 + 24, x1 + 1, y1 + 25);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = highlight;
        ctx.fillText(currentPlayer.displayName, x1 - 2, y1 + 25);
        //Peasant tokens
        peasants = currentPlayer.peasants;
        x1 = x2;
        x2 = x2 + startX[1];
        ctx.beginPath();
        ctx.moveTo(x1 - 1.5, y1);
        ctx.lineTo(x1 - 1.5, y1 + 26);
        ctx.stroke();
        ctx.fillStyle = shadow;
        ctx.fillRect(x1, y1 + 2, (x2 - x1 - 3), 23);
        if (peasants.length < 7){
            for (j = 0; j < peasants.length; j++){
                peasants[j].draw(x1 + (8 * j) + 2, y1 + 4, ctx);
            }
        }
        else {
            peasants[0].draw(x1 + 2, y1 + 4, ctx);
            ctx.fillStyle = highlight;
            ctx.fillText("\u00D7 " + peasants.length, x1 + 24, y1 + 25);
        }
        //Upgrades
        x1 = x2;
        x2 = x2 + startX[2];
        ctx.beginPath();
        ctx.moveTo(x1 - 1.5, y1);
        ctx.lineTo(x1 - 1.5, y1 + 26);
        ctx.stroke();
        ctx.fillStyle = shadow;
        ctx.fillRect(x1, y1 + 2, (x2 - x1 - 3), 23);
        upgrades = currentPlayer.upgrades;
        offset = 1;
        ctx.fillStyle = highlight;
        count = 0;
        for (j = 0; j < upgrades.length; j++){
            //Draw the appropriate upgrade icon, if
            //the upgrade is active
            if (upgrades[j].active){
                ctx.fillRect(x1 + offset, y1 + 4, 23, 19);
                upgrades[j].draw(x1 + offset, y1 + 4, ctx);
                offset += 26;
                count++;
            }
            //Stop drawing upgrades after three
            if (count >= 3){
                break;
            }
        }
        //PP
        x1 = x2;
        x2 = x2 + startX[3];
        ctx.beginPath();
        ctx.moveTo(x1 - 1.5, y1);
        ctx.lineTo(x1 - 1.5, y1 + 26);
        ctx.stroke();
        ctx.fillStyle = shadow;
        ctx.fillRect(x1, y1 + 2, (x2 - x1 - 3), 23);
        ctx.fillStyle = highlight;
        pp = currentPlayer.pp;
        len = ctx.measureText(pp).width;
        space = Math.max((x2 - x1 - len) / 2, 2) - 2;
        ctx.fillText(pp, x1 + space, y1 + 25);
        //VP
        x1 = x2;
        x2 = x2 + startX[4];
        ctx.beginPath();
        ctx.moveTo(x1 - 1.5, y1);
        ctx.lineTo(x1 - 1.5, y1 + 26);
        ctx.stroke();
        ctx.fillStyle = shadow;
        ctx.fillRect(x1, y1 + 2, (x2 - x1 - 3), 23);
        ctx.fillStyle = highlight;
        vp = currentPlayer.vp;
        len = ctx.measureText(vp).width;
        space = Math.max((x2 - x1 - len) / 2, 2) - 2;
        ctx.fillText(vp, x1 + space, y1 + 25);
        //Threat Dial - threat value
        x1 = x2;
        x2 = x2 + 24;
        ctx.beginPath();
        ctx.moveTo(x1 - 1.5, y1);
        ctx.lineTo(x1 - 1.5, y1 + 26);
        ctx.stroke();
        ctx.fillStyle = shadow;
        ctx.fillRect(x1, y1 + 2, 21, 23);
        dialCap = currentPlayer.dialCap;
        dialValue = Number(currentPlayer.dialValue);
        threat = (dialValue < dialCap) ? currentPlayer.threat[dialValue] : "\u221E";
        ctx.fillStyle = highlight;
        len = ctx.measureText(threat).width;
        space = Math.max((24 - len) / 2, 2) - 2;
        ctx.fillText(threat, x1 + space, y1 + 25);
        //Threat Dial - dial advancement
        x1 = x2;
        ctx.beginPath();
        ctx.moveTo(x1 - 1.5, y1);
        ctx.lineTo(x1 - 1.5, y1 + 26);
        ctx.stroke();
        for (j = 0; j < 10; j++){
            //Check to see if the dial cap is hit yet
            if (j < dialCap){
                ctx.fillStyle = shadow;
                ctx.fillRect(x2, y1 + 2, 10, 23);
                //Draw a dial indicator if needed
                if (j < dialValue){
                    ctx.save();
                    ctx.translate(x2, y1);
                    ctx.scale(1.08, 1.75);
                    radGrad = ctx.createRadialGradient(4, 6, 2, 5, 8, 6);
                    radGrad.addColorStop(0.05, highlight);
                    radGrad.addColorStop(0.95, shadow);
                    radGrad.addColorStop(0.97, "rgba(0, 0, 0, 0)");
                    ctx.fillStyle = radGrad;
                    ctx.fillRect(0, 2, 11, 15);
                    ctx.restore();
                }
                //Draw the right cell border
                x2 += 13;
                ctx.beginPath();
                ctx.moveTo(x2 - 1.5, y1);
                ctx.lineTo(x2 - 1.5, y1 + 26);
                ctx.stroke();
            }
            else if (j === 9){
                //Fill the remaining area
                len = 13 * (10 - dialCap) - 1;
                ctx.fillStyle = "#000000";
                ctx.fillRect(x2 - 1, y1 + 1, len, 25);
                ctx.fillStyle = "#111111";
                ctx.fillRect(x2, y1 + 2, len - 2, 23);
                //Draw the right border
                ctx.beginPath();
                ctx.moveTo(x2 + len - 0.5, y1);
                ctx.lineTo(x2 + len - 0.5, y1 + 26);
                ctx.stroke();
            }
        }
        x1 += 130;
        //Dial Advancement Counters
        ctx.fillStyle = shadow;
        ctx.fillRect(x1, y1 + 2, widthAdj - x1, 23);
        dacs = currentPlayer.dacs;
        if (dacs < 6){
            for (j = 0; j < dacs; j++){
                obj = {
                    name : "dac",
                    draw : drawToken
                };
                obj.draw(x1 + (7 * j) + 2, y1 + 4, ctx);
            }
        }
        else {
            obj = {
                name : "dac",
                draw : drawToken
            };
            obj.draw(x1 + 2, y1 + 4, ctx);
            ctx.fillStyle = highlight;
            ctx.fillText("\u00D7 " + dacs, x1 + 23, y1 + 25);
        }
        //Create a drop zone for peasant tokens
        var score = this;
        var scoreDraw = function(){
            score.draw();
        };
        currentPlayer.playerRow = {
            player : currentPlayer,
            tokens : currentPlayer.peasants,
            type : "playerrow",
            draw : scoreDraw,
            drop : dropObject,
            x0 : x,
            y0 : y1,
            x1 : 541,
            y1 : y1 + 26
        };
    }
    //Draw the header row  //HERE
    ctx.font = "15px Tahoma, Helvetica, sans-serif";
    y1 = y;
    y2 = y - 13.5;
    x2 = x + startX[0] - 1.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x2, y1);
    ctx.lineTo(x2, y2 - 0.35);
    ctx.stroke();
    var headers = ["Peasants", "Upgrades", "PP", "VP", "Threat Dials and Tokens"];
    widthAdj = width - 0.5;
    for (i = 0; i < 5; i++){
        //Set the current boundaries
        x1 = x2;
        x2 = (i === 4) ? widthAdj + x : x2 + startX[i + 1];
        //Draw the border
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x1 + 0.15, y2);
        ctx.bezierCurveTo(x1 + 0.15, y2 - 4, x1 + 2, y2 - 5.85, x1 + 6, y2 - 5.85);
        ctx.moveTo(x2 - 6, y2 - 5.85);
        ctx.bezierCurveTo(x2 - 2, y2 - 5.85, x2 - 0.15, y2 - 4, x2 - 0.15, y2);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1 + 5.65, y2 - 6);
        ctx.lineTo(x2 - 5.65, y2 - 6);
        ctx.moveTo(x2, y2 - 0.35);
        ctx.lineTo(x2, y1);
        ctx.stroke();
        //Draw the fill
        ctx.fillStyle = bgcolor;
        ctx.beginPath();
        ctx.moveTo(x1 + 1.5, y1 - 1);
        ctx.lineTo(x1 + 1.5, y2);
        ctx.bezierCurveTo(x1 + 1.5, y2 - 2.4, x1 + 3.6, y2 - 4.5, x1 + 6, y2 - 4.5);
        ctx.lineTo(x2 - 6, y2 - 4.5);
        ctx.bezierCurveTo(x2 - 3.6, y2 - 4.5, x2 - 1.5, y2 - 2.4, x2 - 1.5, y2);
        ctx.lineTo(x2 - 1.5, y1 - 1);
        ctx.closePath();
        ctx.fill();
        //Write the text
        len = ctx.measureText(headers[i]).width;
        space = Math.max((x2 - x1 - len) / 2, 1) - 1;
        ctx.fillStyle = textcolor;
        ctx.fillText(headers[i], x1 + space, y - 1);
    }
}

/* Draw cached cards, if there are any
 */
function drawCache(){
    var cache = this;
    var x = 15;
    var y = 312;
    var x1, y1, y0;
    var width = 235;
    var height = 53;
    var offsetX = 45;
    var offsetY = 26;
    var stepY = 8;
    var bgcolor = "#332211";
    var bgcolor2 = "#332211";
    var ctx = this.ctx;
    var players = this.players;
    var numPlayers = players.length;
    var currentPlayer;
    var cacheSize;
    var i;
    //Clear the drawing area
    ctx.fillStyle = bgcolor;
    ctx.fillRect(x - 5, y - 5, width + 5, height + 5);
    //Draw the cached cards (six at most)
    cacheSize = Math.min(cache.cards.length, 4);
    for (i = 0; i < cacheSize; i++) {
        x1 = x + offsetX * (Math.floor(i / 2));
        y0 = y + stepY * (Math.floor(i / 2));
        y1 = y0 + offsetY * (i % 2);
        cache.cards[i].bgcolor = bgcolor;
        cache.cards[i].bgcolor2 = bgcolor2;
        cache.cards[i].draw(x1, y1, ctx);
    }
    //Create references to each power's own cached cards
    cacheSize = cache.cards.length;
    for (i = 0; i < cacheSize; i++) {
        currentPlayer = cache.cards[i].owner;
        currentPlayer.cache = [];
        currentPlayer.cache.push(cache.cards[i]);
    }
    //Set the card cache's bounding box
    this.x0 = x;
    this.y0 = y;
    this.x1 = x + width;
    this.y1 = y + height;
}

/* Draw a player's reserve area
 */
function drawReserves(){
    var numPlayers = this.map.players.length;
    var width = Math.min((460 / numPlayers) - 10, 76);
    var x0 = 10 + (width + 10) * this.idNum;
    var y0 = 550;
    var height = 50;
    var bordercolor = "#BB7711";
    var shadow = this.shadow;
    var ctx = this.ctx;
    var i, j, figure, x1, y1, x2, y2, x3, y3;
    //Clear the area
    ctx.clearRect(x0, y0, width, height);
    //Draw the fill
    ctx.fillStyle = shadow;
    ctx.fillRect(x0 + 2, y0 + 2, width - 3, height - 3);
    ctx.save();
    ctx.fillStyle = "rgba(17, 17, 17, 0.6)";
    ctx.fillRect(x0 + 1, y0 + 1, width - 1, height - 1);
    ctx.restore();
    //Draw the border
    ctx.lineWidth = 1;
    ctx.strokeStyle = bordercolor;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + 0.5);
    ctx.lineTo(x0 + width + 1, y0 + 0.5);
    ctx.moveTo(x0, y0 + height + 0.5);
    ctx.lineTo(x0 + width + 1, y0 + height + 0.5);
    ctx.moveTo(x0 + 0.5, y0);
    ctx.lineTo(x0 + 0.5, y0 + height + 1);
    ctx.moveTo(x0 + width + 0.5, y0);
    ctx.lineTo(x0 + width + 0.5, y0 + height + 1);
    ctx.stroke();
    //Classify the figures
    var cultists = this.cultists;
    var warriors = this.warriors;
    var daemons = this.daemons;
    //Use the standard stacking method if there
    //are eight or fewer cultists
    if (cultists.length <= 8){
        //Draw cultists in the top row
        x1 = x0 + 4;
        y1 = y0 + 16;
        for (i = 0; i < cultists.length; i++){
            x1 = cultists[i].draw(x1, y1, ctx);
        }
        //Draw daemon(s) in the bottom row
        x2 = x0 + 5;
        y2 = y0 + height - 2;
        for (i = 0; i < daemons.length; i++){
            x2 = daemons[i].draw(x2, y2, ctx);
        }
        //Draw warriors from right to left in the bottom
        //row, then the top row (if necessary)
        for (i = 0; i < warriors.length; i++){
            x3 = x0 + width - 13 * (i + 1);
            if (x3 - 1 < x2){
                break;
            }
            warriors[i].draw(x3, y2, ctx);
        }
        if (i < warriors.length){
            var diff = warriors.length - i;
            y1 = y0 + 23; //Height of a warrior + 1 (or so)
            for (j = 0; j < diff; j++){
                x3 = x0 + width - 13 * (j + 1);
                warriors[i].draw(x3, y1, ctx);
            }
        }
    }
    //Triple-stack cultists if there are
    //more than eight
    else {
        //Draw the daemon(s) in the bottom row
        x2 = x0 + 5;
        y2 = y0 + height - 2;
        for (i = 0; i < daemons.length; i++){
            x2 = daemons[i].draw(x2, y2, ctx);
        }
        //Fill the space above the daemon(s) with cultists,
        //then draw them in three even rows from the left.
        y1 = y0 + 16;
        y3 = y2;
        y2 = y0 + 32;
        var drawCount = 0;
        var xPos = [x0 + 4, x0 + 4, x0 + 4];  //Each value increases over the loop
        var yPos = [y1, y2, y3]; //These values are fixed
        for (i = 0; i < 6; i++){
            if (drawCount >= cultists.length){
                break;
            }
            for (j = 0; j < 3; j++){
                if (j === 0 || xPos[j] >= x2 || x2 === x0 + 5){
                    xPos[j] = cultists[drawCount].draw(xPos[j], yPos[j], ctx);
                    drawCount++;
                    if (drawCount >= cultists.length){
                        break;
                    }
                }
                else {
                    xPos[j] = xPos[0];
                }
            }
        }
        //Draw warriors on the right side, alternating bottom and top
        x1 = x0 + width - 13;
        x2 = x0 + width - 26;
        y1 = y0 + 23;
        xPos = [x1, x1, x2, x2];  //These arrays are fixed, ordered
        yPos = [y3, y1, y3, y1];  //pairs of coordinates
        for (i = 0; i < warriors.length; i++){
            warriors[i].draw(xPos[i], yPos[i], ctx);
        }
    }
    //Set the reserve area's bounding box
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x0 + width + 1;
    this.y1 = y0 + height + 1;
}

