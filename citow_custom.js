
function PluginLoader(board) {
    var $board = $(board);

    var dataLoaders = {
        "gameboardXML" : function (plugin, xmlData) {
            var $tokens = $(xmlData).children('tokens').children(),
                $powers = $(xmlData).children('ruinouspowers').children()

            if ($tokens.length > 0) {
                $tokens.each(function () {
                    var $tokenXML = $(this),
                        name = this.nodeName;
                    $tokenXML.attr("plugin", plugin.name);
                    board.allTokens.push($tokenXML);
                });
            }

            if ($powers.length > 0) {
                $powers.each(function () {
                    var $powerSetupXML = $(this),
                        name = $powerSetupXML.find("name").text();
                    $powerSetupXML.attr("plugin", plugin.name);
                    board.$allPowers[name] = $powerSetupXML;
                });
            }

        }
    };

    var readManifest = function (manifest) {
        var pluginName = manifest.pluginName,
            plugin,
            objectKey;

        //CHAOS.logger.log("Manifest downloaded for plugin " + pluginName);

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
                //CHAOS.logger.log("Checking plugin load status...");
                if (this.isLoaded()) {
                    CHAOS.logger.log("Firing pluginLoaded event...");
                    $board.trigger('pluginLoaded');
                } else {
                    //CHAOS.logger.warn("Plugin " + pluginName + " not yet loaded.");
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
                    //CHAOS.logger.log("Downloading " + objectKey + " component of plugin " + pluginName);
                    $.get("custom/" + pluginName + "/gamedata/" + manifest.gamedata[objectKey] + ".xml",
                           function (responseData) {
                        var nodeName = responseData.documentElement.nodeName,
                            fileref = nodeName + "XML";
                        board.plugins[pluginName][fileref] = responseData.documentElement;
                        // Handle the just-downloaded data, if needed
                        //CHAOS.logger.log("Processing " + nodeName + " component of plugin " + pluginName);
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
        CHAOS.logger.log("Downloading manifest for plugin " + pluginName);
        $.getJSON("custom/" + pluginName.toLowerCase() + "/manifest.json",
                  readManifest);
    };
}
