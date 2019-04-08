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

    // Get the data from the local Scene- & POI-Library
    getJsonFromUrl('data/scene_data/scene_lib.json', function (_wasSuccessful, _data) {
        if (_wasSuccessful) {
            sceneData = _data;
            setSceneInformation(1);
            //initializeSceneSelection();
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
            .append(`<div class='scene-info-container-panel fade-in'><p>${_val['Name']}</p></div>`));
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
 * @param _id | POI ID
 */
function onPoiIdReceived(_id) {
    console.log(`POI with ID ${_id} received from Unity!`);
    console.log(poiData);
    if(_id === -1)
    {
        setToDefault();
        return;
    }

    let poiPoint = poiData.filter(_o => _o.ID === _id)[0];
    console.log(poiPoint);

    if (poiPoint === undefined) {
        console.log(`POI ${_id} not found! Please hug a cat.`);
        setToDefault();
        return;
    }

    poiName.text(poiPoint.Name);
    poiDescription.text(poiPoint.Description);
    loadPoiImage(poiPoint.ImagePath);
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
 * Sets the POI-Section on the website to default.
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
    gameInstance.SendMessage('GameManager', 'ReceiveSceneID', Number(_id));
    console.log(`SendSceneIDToUnity: ${_id}`);
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

    sceneName.text(scene.Name);
    sceneID.text(`[${scene.ID}]`);
    sceneDescription.text(scene.Description);
    currentScene = scene;
}

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
