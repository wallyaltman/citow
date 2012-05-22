
function PluginLoader(board) {
    var $board = $(board);

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

    var storeIconLocation = function (x, y) {
        this.x0 = x;
        this.y0 = y;
        this.x1 = x + this.icon.dimX;
        this.y1 = y + this.icon.dimY;
    };

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
            obj.constructor.prototype.draw = function (x1, y1, ctx1) {
                this.icon.draw(x1, y1, ctx1);
                this.setLocation(x1, y1);
            };
            obj.icon.draw(x, y, ctx);
            obj.setLocation(x, y);
        };

        if (!this.icon) {
            (function (iconType) {
                if (object.plugin[iconType + "SpritesSrc"]) {
                    spriteSheet = object.plugin[iconType + "Sprites"] ||
                        loadSpriteSheet(object.plugin, iconType);
                    object.constructor.prototype.icon = {
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
                    object.constructor.prototype.icon = {
                        "img"  : iconImg,
                        "dimX" : object.width,
                        "dimY" : object.height,
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
                    var i, count, pool
                        supply = Number(tokenNode.textContent),
                        tokenPool = board.map.tokenPool,
                        tokenName = tokenNode.nodeName;

                    pool = new TokenPool(tokenName);
                    tokenPool[tokenName] = pool;
                    tokenPool._list.push(pool);

                    count = 0;

                    function CustomToken () {
                        var idString;

                        this.name = tokenName;
                        this.type = "token";
                        this.home = pool;
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

                    CustomToken.prototype.draw = drawIcon;
                    CustomToken.prototype.setLocation = storeIconLocation;

                    for (i = 0; i < supply; i++) {
                        pool.addToken(new CustomToken());
                    }
                });
            }

            if ($powers.length > 0) {
                $powers.each(function (index, powerNode) {
                    var $powerSetupXML = $(powerNode),
                        name = $powerSetupXML.find("name").text();
                    board.allPowers[name] = $powerSetupXML;
                });
            }

        }
    };

    var readManifest = function (manifest) {
        var pluginName = manifest.pluginName,
            plugin,
            objectKey;

        //console.log("Manifest downloaded for plugin " + pluginName);

        plugin = {
            "name" : pluginName,
            "toLoad" : [],
            "loaded" : [],
            "isPlugin" : true,
            "isLoaded" : function () {
                var toLoadCount = this.toLoad.length,
                    loadedCount = this.loaded.length;
                return toLoadCount === loadedCount;
            },
            "checkLoadStatus" : function () {
                //console.log("Checking plugin load status...");
                if (this.isLoaded()) {
                    console.log("Firing pluginLoaded event...");
                    $board.trigger('pluginLoaded');
                } else {
                    //console.warn("Plugin " + pluginName + " not yet loaded.");
                }
            }
        };
        board.plugins[pluginName] = plugin;
        board.plugins._list.push(plugin);
        board.plugins._count += 1;

        // Load the XML game data via AJAX calls
        if (manifest.gamedata) {
            for (objectKey in manifest.gamedata) {
                if (manifest.gamedata.hasOwnProperty(objectKey)) {
                    plugin.toLoad.push(objectKey);
                    //console.log("Downloading " + objectKey + " component of plugin " + pluginName);
                    $.get("custom/" + pluginName + "/gamedata/" + manifest.gamedata[objectKey] + ".xml",
                           function (responseData) {
                        var nodeName = responseData.documentElement.nodeName,
                            fileref = nodeName + "XML";
                        board.plugins[pluginName][fileref] = responseData.documentElement;
                        // Handle the just-downloaded data, if needed
                        //console.log("Processing " + nodeName + " component of plugin " + pluginName);
                        if (dataLoaders[fileref]) {
                            dataLoaders[fileref](plugin, responseData.documentElement);
                        }
                        // Add this to the list of parts that have been loaded
                        plugin.loaded.push(nodeName);
                        // Fire a custom event if this was the last bit
                        // to be loaded
                        plugin.checkLoadStatus();
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
        console.log("Downloading manifest for plugin " + pluginName);
        $.getJSON("custom/" + pluginName.toLowerCase() + "/manifest.json",
                  readManifest);
    };
}
