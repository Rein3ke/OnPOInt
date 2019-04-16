// Marvin Burkhard Kullick @ Copyright 2019

"use strict";

let poiData = [];
let sceneData = [];

let poiName;
let poiDescription;

let sceneName;
let sceneID;
let sceneDescription;

let sceneInfoContainer;

let currentScene;
let currentPOI;

/**
 * Start Function - Here begins the magic
 * After website finished loading: Set all necessary variables $ load data (Scenes, POIs) from JSON-files
 */
window.onload = function () {
    poiName             = $("#poi_name");
    poiDescription      = $("#poi_description");

    sceneName           = $("#scene_name");
    sceneID             = $("#scene_id");
    sceneDescription    = $("#scene_description");

    sceneInfoContainer = $("#sceneInfoContainer");

    RegisterCallback(1, onPoiIdReceived);

    // Get the data from the local Scene- & POI-Library
    getJsonFromUrl('data/scene_data/scene_lib.json', function (_wasSuccessful, _data) {
        if (_wasSuccessful) {
            sceneData = _data;
            setSceneInformation(1);
            getJsonFromUrl('data/poi_data/poi_lib.json', function (_wasSuccessful, _data) {
                if (_wasSuccessful) {
                    console.log(_data);
                    poiData = _data;
                }
            });
        }
    });
    setToDefault();
};

/**
 * Displays all available scenes in a panel overview, if the "Change Scene" button is pressed.
 */
function toggleSceneChangePanel() {
    // Doesnt work, if the module is missing
    if (!sceneInfoContainer) return;
    if (sceneInfoContainer.is(":visible")) {
        sceneInfoContainer.hide();
        sceneInfoContainer.empty();
    } else {
        sceneInfoContainer.show();
        $.each(sceneData, (_key, _val) => sceneInfoContainer
            .append(`<div class='scene-info-container-panel fade-in'><button type="button" onclick="sendSceneIDToUnity(${_val.ID})">${_val.Name}</button></div>`));
    }
}

/**
 * Fills the dropdown menu with data from the Scene Library
 */
/*function initializeSceneSelection() {
    $.each(sceneData, (_key, _val) => sceneSelection.append(`<option value="${_val['ID']}">${_val['Name']}</option>`));
}*/

/**
 * Unity -> JS
 * Gets called from Unity
 * @param _poiProtocolObject
 */
function onPoiIdReceived(_poiProtocolObject) {
    if(_poiProtocolObject === undefined) return;
    let id = _poiProtocolObject.ID;

    console.log(`POI with ID ${id} received from Unity!`);

    // Error Codes
    if(id === -1)
    {
        return;
    }

    let loadedPOI = poiData.filter(_o => _o.ID === id)[0];

    if (loadedPOI === undefined) {
        console.log(`POI ${id} not found! Please hug a cat.`);
        return;
    }

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
 *
 * @param _imagePath
 */
function loadPoiImage(_imagePath) {
    let loadingGif = $("<img />").attr('src', 'resources/images/gif-loading.gif');
    $("#poi_image").html(loadingGif);
    let img = $("<img />").attr('src', _imagePath)
        .on('load', function () {
            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth === 0) {
                alert('Broken Image');
            } else {
                $("#poi_image").html(img);
            }
        });
}

/**
 * Sets the POI-Section on the website to a default message.
 */
function setToDefault() {
    poiName.text("[Point of Interest]");
    poiDescription.text("For more information, take a look at a POI.");
    loadPoiImage("https://via.placeholder.com/200");
}

/**
 * Reads the URL and opens the JSON file located there.
 * @param url | Path to JSON-File
 * @param _onResponse | (callback) true on success
 */
function getJsonFromUrl(url, _onResponse) {
    $.getJSON(url, function (data) {
        if (data === undefined) {
            _onResponse(false, undefined);
            return;
        }
        _onResponse(true, data['Data']);
    })
}

/**
 * JS -> Unity
 * Send Scene ID to Unity
 * @param _id | Scene ID
 */
function sendSceneIDToUnity(_id) {
    console.log(`SendSceneIDToUnity: ${_id}`);
    setSceneInformation(_id);
    SendData(CreateScenePO(Number(_id)));
}

/**
 * Load the data from the scene library and provide it on the website.
 * @param _id | Scene ID
 */
function setSceneInformation(_id) {
    console.log(sceneData);
    let ID = Number(_id);
    let scene = sceneData.filter(_o => _o.ID === ID)[0];
    if (scene === undefined) {
        console.log(`Scene ${_id} could not be found!`);
        return;
    }

    currentScene = scene;

    sceneName.text(currentScene.Name);
    sceneID.text(`[${currentScene.ID}/${sceneData.length}]`);
    sceneDescription.text(currentScene.Description);

}

// Möglicherweise obsolet, da Unity den LockState auch über die Input-Abfrage vom LockStateManager selbst händelt
/**
 * JS -> Unity
 * Send a lock request to Unity (pauses the controls)
 * @param _isLocked | Current lock mode
 */
function ToggleLockState(_isLocked) {
    let lockState; // A number representing the lock state in Unity (0 = NONE, 1 = LOCKED, 2 = CONFINED)

    // Check the default LockState and, if true, sets the GameContainer in HTML
    if (_isLocked) {
        document.getElementById("gameContainer").requestPointerLock();
        lockState = 1;
    } else {
        lockState = 0;
    }

    console.log(`ToggleLockState: ${lockState}`);
    gameInstance.SendMessage('GameManager', 'SetLockState', lockState);
}
