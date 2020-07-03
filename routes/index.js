var express = require('express');
var router = express.Router();

let packg = require('../package.json');
let version = packg.version;

router.get('/', (req, res) => {
    res.json('New System API for poc' + " " + version);
});

module.exports = router;
