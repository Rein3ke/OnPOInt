const express       = require('express');
const fs            = require('fs');

const router        = express.Router();

const sceneDataPath = require('../public/scene_lib');
const poiDataPath   = require('../public/poi_lib');

router.get('/scenes/:id?', (_req, _res) => {
    let data = readJsonFileSync('public/scene_lib.json')['Data'];
    let response = sceneDataPath;

    if (_req.params.id) {
        data.forEach((element) => {
           if (element.ID === Number(_req.params.id)) response = element;
        });
    }
    _res.json(response);
});

router.get('/poi/:id?', (_req, _res) => {
    let data = readJsonFileSync('public/poi_lib.json')['Data'];
    let response = poiDataPath;

    if (_req.params.id) {
        data.forEach((element) => {
            if (element.ID === Number(_req.params.id)) response = element;
        });
    }
    _res.json(response);
});

function readJsonFileSync(_filePath) {
    let file = fs.readFileSync(_filePath, (err => {
        if (err) throw err;
    }));
    return JSON.parse(file);
}

module.exports = router;
