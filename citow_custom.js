
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
        var spriteSheet, iconImg, loadTimer, that = this;

        var finish = function (obj) {
            obj.draw = function (x, y, ctx) {
                obj.icon.draw(x, y, ctx);
            };
            obj.icon.draw();
        };

        if (!this.icon) {
            (function (iconType) {
                if (this.plugin[iconType + "SpritesSrc"]) {
                    spriteSheet = this.plugin[iconType + "Sprites"] ||
                        loadSpriteSheet(this.plugin, iconType);
                    this.icon = {
                        "img"  : spriteSheet,
                        "srcX" : this.xmlData.getAttribute("srcx"),
                        "srcY" : this.xmlData.getAttribute("srcy"),
                        "dimX" : this.width,
                        "dimY" : this.height,
                        "draw" : drawFromSheet
                    };
                } else {
                    iconImg = this.plugin[this.name] ||
                        loadSingletonImage(plugin, this.name)
                    this.icon = {
                        "img"  : iconImg,
                        "draw" : drawSingleton
                    };
                }
            })(this.iconType);
        }

        if (this.icon.img.complete) {
            finish(this);
        } else {
            loadTimer = setInterval(function () {
                if (that.icon.img.complete) {
                    clearInterval(loadTimer);
                    finish(that);
                }
            }, 100);
        }
    };

    var readManifest = function (manifest) {
        var pluginName = manifest.pluginName,
            objectKey;

        if (!board.plugins) {
            board.plugins = {};
        }
        board.plugins[pluginName] = { "name" : pluginName };

        // Load the XML game data via AJAX calls
        if (manifest.gamedata) {
            for (objectKey in manifest.gamedata) {
                if (manifest.gamedata.hasOwnProperty(objectKey)) {
                    $.get("custom/" + pluginName + "/gamedata/" + manifest.gamedata[objectKey] + ".xml",
                           function (responseData) {
                        var fileref = responseData.documentElement.nodeName + "XML";
                        board.plugins[pluginName][fileref] = responseData;
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
