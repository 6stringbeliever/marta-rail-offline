const ParseCSV = function() {
  'use strict';

  const parse = function(csvString) {
    let rows = _splitDoc(csvString);
    const headers = _splitLine(rows[0]);
    rows.splice(0, 1);
    return _createObject(headers, rows);
  };

  const _splitDoc = function(str) {
    return str.trim().split('\n');
  };

  const _splitLine = function(str) {
    return str.split(',').map((val) => {
      return val.trim();
    });
  };

  const _createObject = function(headers, body) {
    let output = body.map((row, index) => {
      let data = _splitLine(row);
      let outputObj = {};
      if (data.length !== headers.length) {
        throw new Error(`Row ${index} length does not match header length`);
      }
      for (let i = 0; i < headers.length; i++) {
        outputObj[headers[i]] = data[i];
      }
      return outputObj;
    });
    return output;
  };

  return { parse: parse };
};
