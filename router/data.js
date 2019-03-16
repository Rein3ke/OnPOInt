const express       = require('express');
const fs            = require('fs');

const router        = express.Router();

const sceneDataPath = require('../public/data/scene_data/scene_lib');
const poiDataPath   = require('../public/data/poi_data/poi_lib');

router.get('/scenes/:id?', (_req, _res) => {
    let data = readJsonFileSync('public/data/scene_data/scene_lib.json')['Data'];
    let response = sceneDataPath;

    if (_req.params.id) {
        data.forEach((element) => {
           if (element.ID === Number(_req.params.id)) response = element;
        });
    }
    _res.json(response);
});

router.get('/poi/:id?', (_req, _res) => {
    let data = readJsonFileSync('public/data/poi_data/poi_lib.json')['Data'];
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
