"use strict";

let poiData = [];
let sceneData = [];

let poiName;
let poiDescription;

let sceneName;
let sceneDescription;
let sceneSelection;

window.onload = function () {
    poiName             = $("#poi_name");
    poiDescription      = $("#poi_description");

    sceneName           = $("#scene_name");
    sceneDescription    = $("#scene_description");
    sceneSelection      = $("#sceneSelection");

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
};

/**
 * Gets called from Unity
 * @param _id | POI
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
}

function setToDefault() {
    poiName.text("None");
    poiDescription.text("Please look at a POI point.");
}

function getJsonFromUrl(url, _onResponse) {
    $.getJSON(url, function (data) {
        if (data === undefined) {
            _onResponse(false, undefined);
            return;
        }
        _onResponse(true, data['Data']);
    })
}

function initializeSceneSelection() {
    $.each(sceneData, function (_key, _val) {
        sceneSelection.append(`<option value="${_val['ID']}">${_val['Name']}</option>`);
    })
}

/**
 * Send Scene ID to Unity
 * @param _id | Scene
 */
function sendSceneIDToUnity(_id) {
    setSceneInformation(_id);
    gameInstance.SendMessage('GameManager', 'ReceiveSceneID', Number(_id));
    console.log("Sent Scene to Unity: " + _id);
}

function setSceneInformation(_id) {
    let ID = Number(_id);
    let scene = sceneData.filter(_o => _o.ID === ID)[0];
    console.log(sceneData);
    sceneName.text(scene.Name);
    sceneDescription.text(scene.Description);
}

function ToggleLockState(_isLocked) {
    let lockState; // A number representing the lock state in Unity (0 = NONE, 1 = LOCKED, 2 = CONFINED)

    /**
     * Ueberprueft den gesetzen LockState und setzt, wenn true, den GameContainer in HTML auf fokussiert.
     */
    if (_isLocked) {
        document.getElementById("gameContainer").requestPointerLock();
        //document.getElementById("gameContainer").focus();
        lockState = 1;
    } else {
        lockState = 0;
        //document.getElementById("gameContainer").blur();
    }

    // Sendet eine Request an Unity zum Setzen des internen LockState.
    console.log("Send to Unity: " + lockState);
    gameInstance.SendMessage('GameManager', 'SetLockState', lockState);
}
