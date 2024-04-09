const fluxicons = require('@codegasms/fluxicons');
const fs = require('fs');
const path = require('path');

const strings = [
    { str: 'codegasms', size: 64 },
    { str: 'codegasms', size: 128 },
    { str: 'codegasms', size: 256 },
    { str: 'codegasms', size: 512 },
    { str: 'codegasms', size: 1024 },
    { str: 'flux', size: 64 },
    { str: 'flux', size: 128 },
    { str: 'flux', size: 256 },
    { str: 'flux', size: 512 },
    { str: 'flux', size: 1024 },
    { str: 'fluxicons', size: 64 },
    { str: 'fluxicons', size: 128 },
    { str: 'fluxicons', size: 256 },
    { str: 'fluxicons', size: 512 },
    { str: 'fluxicons', size: 1024 },
];

const imagePath = path.join(__dirname, 'images');
const dataPath = path.join(__dirname, 'data');

strings.forEach(({ str, size }) => {
    var data = fluxicons.fluxicon(str, size, 'data');
    var buffer = fluxicons.fluxicon(str, size, 'image');
    var base64Buffer = buffer.toString('base64');

    fs.writeFileSync(imagePath + `/fluxicons_${str}_${size}.png`, buffer);
    fs.writeFileSync(dataPath + `/fluxicons_${str}_${size}.txt`, base64Buffer);
});
