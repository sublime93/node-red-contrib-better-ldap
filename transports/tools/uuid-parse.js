'use strict';

// Maps for number <-> hex string conversion
let _byteToHex = [];
let _hexToByte = {};
for (let i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
    let i = (buf && offset) || 0;
    let ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
        if (ii < 16) { buf[i + ii++] = _hexToByte[oct]; }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) { buf[i + ii++] = 0; }

    return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
    let i = offset || 0;
    let bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] +
        bth[buf[i++]] + bth[buf[i++]] +
        bth[buf[i++]] + bth[buf[i++]];
}

module.exports = { parse, unparse };