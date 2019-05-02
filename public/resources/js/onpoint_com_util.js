/**
 * @summary This file is used to transfer protocol objects to the Unity Build. In addition, the file is able to receive data from Unity.
 * @author Marvin Burkhard Kullick
 * @since 02.05.2019
 */

/**
 * Callback register - Object that stores type and function pairs
 * @type {{}}
 */
let callbackRegister = {};

/**
 * @summary Binds a type (int) to a callback function and registers it in the callbackRegister object.
 *
 * @param {int}         _type       Protocol object type.
 * @param {function}    _callback   Callback-Function.
 */
function RegisterCallback(_type, _callback) {
    if(_type in callbackRegister) {
        console.warn("Callback for type " + _type + " was already registered.");
        return;
    }
    callbackRegister[_type] = _callback;
}

/**
 * @description This method is called from native code interface com_util.jslib.
 * Gets a _pObject passed, determines the type and executes the corresponding callback function.
 * @access  private
 *
 * @param   _pObject            Serialized protocol object.
 */
function OnUnityDataReceived(_pObject) {
    if(_pObject.Type in callbackRegister) {
        callbackRegister[_pObject.Type](_pObject);
        return;
    }
    console.log("Error: Invalid type parameter provided.");
}

/**
 * @summary Communicates to ComUtility class via SendMessage().
 *
 * @param   {string} _poObject  Json string that defines a protocol object.
 */
function SendData(_poObject) {
    //use this to send po objects to unity
    gameInstance.SendMessage("ComUtility", "OnWebDataReceived", _poObject);
}

//Helper functions to easily create PO objects from js.
/**
 * @summary Helper function to create a Scene Protocol Object.
 *
 * @param   {int}       _id     Scene id.
 * @return  {string}            Scene protocol object as json string.
 */
function CreateScenePO(_id) {
    return JSON.stringify({ 'SceneID':_id, 'Type':2 });
}

/**
 * @summary Helper function to create a Speed Protocol Object.
 *
 * @param   {int}       _value  Speed value.
 * @return  {string}            Speed protocol object as json string.
 */
function CreateSpeedPO(_value) {
    return JSON.stringify({'Value':_value, 'Type': 3});
}

/**
 * @summary Helper function to create a Sensibility Protocol Object.
 *
 * @param   {int}       _value  Sensibility value.
 * @return  {string}            Sensibility protocol object as json string.
 */
function CreateSensibilityPO(_value) {
    return JSON.stringify({'Value':_value, 'Type': 4});
}
