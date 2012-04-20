
function PluginLoader(board) {
    var readManifest = function (manifest) {
        var pluginName = manifest.pluginName,
            objectKey;

        if (!board.plugins) {
            board.plugins = {};
        }
        board.plugins[pluginName] = {};

        if (manifest.gamedata) {
            for (objectKey in manifest.gamedata) {
                if (manifest.gamedata.hasOwnProperty(objectKey)) {
                    $.ajax("custom/" + pluginName + "/gamedata/" + manifest.gamedata[objectKey] + ".xml",
                           function (responseData) {
                        board.plugins[pluginName][objectKey + "XML"] = responseData;
                    });
                }
            }
        }

        if (manifest.icons) {
            for (objectKey in manifest.icons) {
                if (manifest.icons.hasOwnProperty(objectKey)) {
                    board.plugins[pluginName][objectKey] = manifest.gamedata[objectKey];
                }
            }
        }
    };

    this.addPlugin = function (pluginName) {
        $.getJSON("custom/" + pluginName.toLowerCase() + "/manifest.json",
                  readManifest);
    };
}
