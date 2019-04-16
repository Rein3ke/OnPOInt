let callbackRegister = {};

function RegisterCallback(_type, _callback) {
    if(_type in callbackRegister) {
        console.warn("Callback for type " + _type + " was already registered.");
        return;
    }
    callbackRegister[_type] = _callback;
}

//this method is called from native code interface com_util.jslib
function OnUnityDataReceived(_pObject) {
    if(_pObject.Type in callbackRegister) {
        callbackRegister[_pObject.Type](_pObject);
        return;
    }
    console.log("Error: Invalid type parameter provided.");
}

//use this to send po objects to unity
function SendData(_poObject) {
    gameInstance.SendMessage("ComUtility", "OnWebDataReceived", _poObject);
}

//Helper functions to easily create PO objects from js.
function CreateScenePO(_id) {
    return JSON.stringify({ 'SceneID':_id, 'Type':2 });
}
