/**
 * @summary This file takes care of the website's user interface, user input and replaces content in the scene and POI area.
 * @author Marvin Burkhard Kullick
 * @since 02.05.2019
 */

"use strict"; // Make use of the strict mode

/**
 * An array where POI data is stored.
 * @type {Array}
 */
let poiData = [];
/**
 * An array where Scene data is stored
 * @type {Array}
 */
let sceneData = [];

let poiName;
let poiDescription;

let sceneName;
let sceneID;
let sceneDescription;

let sceneInfoContainer;

/**
 * Saves the current scene.
 */
let currentScene;
/**
 * Saves the current poi.
 */
let currentPOI;

/**
 * @summary Start Function.
 * @description After website finished loading: Sets all necessary variables $ load data (Scenes, POIs) from JSON-files
 */
window.onload = function () {
    // Stores all relevant HTML elements in variables.
    poiName             = $("#poi_name");
    poiDescription      = $("#poi_description");

    sceneName           = $("#scene_name_id");
    sceneID             = $("#scene_id");
    sceneDescription    = $("#scene_description");

    sceneInfoContainer = $("#sceneInfoContainer");

    // Inserts a type callback pair into the register.
    RegisterCallback(1, onPoiIdReceived);

    // Gets the data from the local Scene- & POI-Library
    getJsonFromUrl('data/scene_data/scene_lib.json', function (_wasSuccessful, _data) {
        if (_wasSuccessful) {
            sceneData = _data;
            getJsonFromUrl('data/poi_data/poi_lib.json', function (_wasSuccessful, _data) {
                if (_wasSuccessful) {
                    poiData = _data;
                }
            });
        }
    });
    setToDefault();
};

/**
 * @summary Displays all available scenes in a panel overview, if the "Change Scene" button is pressed.
 */
function toggleSceneChangePanel() {
    if (!sceneInfoContainer) return; // Function is not executed if the module is not present.
    if (sceneInfoContainer.is(":visible")) {
        sceneInfoContainer.hide();
        sceneInfoContainer.empty();
    } else {
        sceneInfoContainer.show();
        $.each(sceneData, (_key, _val) => {
            if (currentScene !== undefined && _val.ID === currentScene.ID) {
                sceneInfoContainer
                    .append(`<div class='scene-info-container-panel scene-info-container-panel__disabled animation__fade-in'><button type="button" onclick="sendSceneIDToUnity(${_val.ID});toggleSceneChangePanel()">${_val.Name}</button></div>`);
            } else {
                sceneInfoContainer
                    .append(`<div class='scene-info-container-panel animation__fade-in'><button type="button" onclick="sendSceneIDToUnity(${_val.ID});toggleSceneChangePanel()">${_val.Name}</button></div>`);
            }
        });
    }
}

/**
 * @summary Gets called from Unity. The function searches for a POI with the exact ID in the array and sets its information in the HTML.
 *
 * @param {Object} _poiProtocolObject   POI protocol object.
 */
function onPoiIdReceived(_poiProtocolObject) {
    if(_poiProtocolObject === undefined) return; // Function is not executed if the poi protocol object is undefined.
    let id = _poiProtocolObject.ID;

    /**
     * POI Code -1 = EProtocolObjectType.NONE
     * Can be used to set an optional event.
     */
    if(id === -1) {
        return;
    }

    // It searches for a POI with the given ID. Undefined means that nothing was found.
    let loadedPOI = poiData.filter(_o => _o.ID === id)[0];
    if (loadedPOI === undefined) {
        return;
    }

    // The first if condition is called only once.
    if (currentPOI === undefined) {
        currentPOI = loadedPOI;

        poiName.text(currentPOI.Name);
        poiDescription.text(currentPOI.Description);
        loadPoiImage(currentPOI.ImagePath);
    } else if (loadedPOI.ID === currentPOI.ID) {
        return;
    } else {
        currentPOI = loadedPOI;
    }

    poiName.text(currentPOI.Name);
    poiDescription.text(currentPOI.Description);
    loadPoiImage(currentPOI.ImagePath);
}

/**
 * @summary Loads an image using a given URL and places it in the image area of the website.
 *
 * @param {string} _imagePath   URL leading to the image.
 */
function loadPoiImage(_imagePath) {
    // Displays a loading gif, while downloading the image
    let loadingGif = $("<img />").attr('src', 'resources/images/gif-loading.gif');
    $("#poi_image").html(loadingGif);

    let img = $("<img />").attr('src', _imagePath)
        .on('load', function () {
            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth === 0) {
                return;
            } else {
                $("#poi_image").html(img);
            }
        });
}

/**
 * @summary Sets the POI-Section on the website to a default message.
 */
function setToDefault() {
    poiName.text("[Point of Interest]");
    poiDescription.text("For more information, take a look at a POI.");
    loadPoiImage("https://via.placeholder.com/200");
}

/**
 * @summary Reads the URL and opens the json file located there.
 * @param {string}      url             Path to json file
 * @param {function}    _onResponse     Callback function (returns true if success)
 */
function getJsonFromUrl(url, _onResponse) {
    $.getJSON(url, function (data) {
        if (data === undefined) {
            // File could not be loaded successfully
            _onResponse(false, undefined);
            return;
        }
        // File could be loaded successfully
        _onResponse(true, data['Data']);
    })
}

/**
 * @summary Send Scene ID to Unity.
 *
 * @param {int}         _id             Scene id.
 */
function sendSceneIDToUnity(_id) {
    setSceneInformation(_id);
    SendData(CreateScenePO(Number(_id)));
}

/**
 * @summary Load the data from the scene library and provide it on the website.
 *
 * @param {int}         _id             Scene id.
 */
function setSceneInformation(_id) {
    let ID = Number(_id);
    // It searches for a Scene with the given ID. Undefined means that nothing was found.
    let scene = sceneData.filter(_o => _o.ID === ID)[0];
    if (scene === undefined) {
        return;
    }

    currentScene = scene;

    sceneName.text(`${currentScene.Name} [${currentScene.ID}/${sceneData.length}]`);
    sceneDescription.text(currentScene.Description);
}
