// Marvin Burkhard Kullick @ Copyright 2019

"use strict";

let poiData = [];
let sceneData = [];

let poiName;
let poiDescription;

let sceneName;
let sceneDescription;
let sceneSelection;

/**
 * Start Function - Here begins the magic
 * After website finished loading: Set all necessary variables $ load data (Scenes, POIs) from JSON-files
 */
window.onload = function () {
    poiName             = $("#poi_name");
    poiDescription      = $("#poi_description");

    sceneName           = $("#scene_name");
    sceneDescription    = $("#scene_description");
    sceneSelection      = $("#sceneSelection");

    // Get the data from the local Scene- & POI-Library
    getJsonFromUrl('scene_lib.json', function (_wasSuccessful, _data) {
        if (_wasSuccessful) {
            sceneData = _data;
            initializeSceneSelection();
            getJsonFromUrl('poi_lib.json', function (_wasSuccessful, _data) {
                if (_wasSuccessful) {
                    poiData = _data;
                }
            });
        }
    });
    setToDefault();
};

/**
 * Fills the dropdown menu with data from the Scene Library
 */
function initializeSceneSelection() {
    $.each(sceneData, (_key, _val) => sceneSelection.append(`<option value="${_val['ID']}">${_val['Name']}</option>`));
}

/**
 * Unity -> JS
 * Gets called from Unity
 * @param _id | POI ID
 */
function onPoiIdReceived(_id) {
    console.log(`${_id} received from Unity!`);
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
 * Sets the POI-text on the website to default.
 */
function setToDefault() {
    poiName.text("None");
    poiDescription.text("Please look at a POI point.");
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
    setSceneInformation(_id);
    gameInstance.SendMessage('GameManager', 'ReceiveSceneID', Number(_id));
    console.log("Sent Scene to Unity: " + _id);
}

/**
 * Load the data from the scene library and provide it on the website.
 * @param _id | Scene ID
 */
function setSceneInformation(_id) {
    let ID = Number(_id);
    let scene = sceneData.filter(_o => _o.ID === ID)[0];
    console.log(sceneData);
    sceneName.text(scene.Name);
    sceneDescription.text(scene.Description);
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
        //Unused: document.getElementById("gameContainer").focus();
        lockState = 1;
    } else {
        lockState = 0;
        //Unused: document.getElementById("gameContainer").blur();
    }

    console.log("Send to Unity: " + lockState);
    gameInstance.SendMessage('GameManager', 'SetLockState', lockState);
}
