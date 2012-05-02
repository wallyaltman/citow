
function PluginLoader(board) {
    var loadSpriteSheet = function (plugin, iconType) {
        var sheet = iconType + "Sprites";

        plugin[sheet] = document.createElement('img');
        plugin[sheet].src = "custom/" + plugin.name + "/icons/" + plugin[sheet + "Src"];

        return plugin[sheet];
    };

    var loadSingletonImage = function (plugin, iconName) {
        plugin[iconName] = document.createElement('img');
        plugin[iconName].src = "custom/" + plugin.name + "/icons/" +
            iconName + ".png";

        return plugin[iconName];
    }

    var drawFromSheet = function (x, y, ctx) {
        ctx.drawImage(this.img, this.srcX, this.srcY, this.dimX, this.dimY,
                      x, y, this.dimX, this.dimY);
    };

    var drawSingleton = function (x, y, ctx) {
        ctx.drawImage(this.img, x, y);
    };

    /* The new and improved lazy drawing function! This really ought to be
     * backported to the main application.
     */
    var drawIcon = function (x, y, ctx) {
        var spriteSheet, iconImg, loadTimer,
            object = this;

        var finish = function (obj) {
            obj.constructor.prototype.draw = function (x, y, ctx) {
                obj.icon.draw(x, y, ctx);
            };
            obj.icon.draw();
        };

        if (!this.icon) {
            (function (iconType) {
                if (object.plugin[iconType + "SpritesSrc"]) {
                    spriteSheet = object.plugin[iconType + "Sprites"] ||
                        loadSpriteSheet(object.plugin, iconType);
                    object.icon = {
                        "img"  : spriteSheet,
                        "srcX" : object.xmlData.getAttribute("srcx"),
                        "srcY" : object.xmlData.getAttribute("srcy"),
                        "dimX" : object.width,
                        "dimY" : object.height,
                        "draw" : drawFromSheet
                    };
                } else {
                    iconImg = object.plugin[object.name] ||
                        loadSingletonImage(object.plugin, object.name)
                    object.icon = {
                        "img"  : iconImg,
                        "draw" : drawSingleton
                    };
                }
            })(this.type);
        }

        if (this.icon.img.complete) {
            finish(this);
        } else {
            loadTimer = setInterval(function () {
                if (object.icon.img.complete) {
                    clearInterval(loadTimer);
                    finish(object);
                }
            }, 100);
        }
    };

    var dataLoaders = {
        "gameboardXML" : function (plugin, xmlData) {
            var $tokens = $(xmlData).children('tokens').children(),
                $powers = $(xmlData).children('ruinouspowers').children()

            if ($tokens.length > 0) {
                $tokens.each(function (index, tokenNode) {
                    var i, Token, token, count,
                        supply = Number(tokenNode.textContent),
                        tokenPool = board.map.tokenPool,
                        tokenName = tokenNode.nodeName;

                    tokenPool[tokenName] = {
                        "name"   : tokenName,
                        "type"   : "pool",
                        "tokens" : []
                    };

                    count = 0;

                    Token = function () {
                        var idString;

                        this.name = tokenName;
                        this.type = "token";
                        this.home = tokenPool[tokenName];
                        this.xmlData = tokenNode;
                        this.width = 19;
                        this.height = 19;
                        this.plugin = plugin;

                        count += 1;
                        idString = String(count);
                        idString = (idString.length === 1) ? "0" + idString : idString;

                        this.objectID = this.name.substr(0,3) + idString;
                        this.objectID.toUpperCase();
                    }

                    Token.prototype.draw = drawIcon;

                    for (i = 0; i < supply; i++) {
                        token = new Token();
                        tokenPool[tokenName].tokens.push(token);
                    }
                });
            }
        },

        "chaoscardsXML" : function (plugin, xmlData) {

        }
    };

    var readManifest = function (manifest) {
        var pluginName = manifest.pluginName,
            plugin,
            objectKey;

        if (!board.plugins) {
            board.plugins = {};
        }

        plugin = { "name" : pluginName };
        board.plugins[pluginName] = plugin;

        // Load the XML game data via AJAX calls
        if (manifest.gamedata) {
            for (objectKey in manifest.gamedata) {
                if (manifest.gamedata.hasOwnProperty(objectKey)) {
                    $.get("custom/" + pluginName + "/gamedata/" + manifest.gamedata[objectKey] + ".xml",
                           function (responseData) {
                        var fileref = responseData.documentElement.nodeName + "XML";
                        board.plugins[pluginName][fileref] = responseData.documentElement;
                        dataLoaders[fileref](plugin, responseData.documentElement);
                    });
                }
            }
        }

        // For now, just get the names of icons, upgrades, and sprite sheets
        if (manifest.icons) {
            for (objectKey in manifest.icons) {
                if (manifest.icons.hasOwnProperty(objectKey)) {
                    board.plugins[pluginName][objectKey] = manifest.icons[objectKey];
                }
            }
        }
    };

    this.addPlugin = function (pluginName) {
        $.getJSON("custom/" + pluginName.toLowerCase() + "/manifest.json",
                  readManifest);
    };
}
