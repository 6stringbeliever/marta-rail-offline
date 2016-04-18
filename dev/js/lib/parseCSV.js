class ParseCSV {

  parse(csvString) {
    this._csvString = csvString;
    const rows = this._splitDoc(this._csvString);
    const headers = this._splitLine(rows[0]);
    return this._createObject(headers, rows);
  }

  _splitDoc(str) {
    return str.trim().split('\n');
  }

  _splitLine(str) {
    return str.split(',').map((val) => {
      return val.trim();
    });
  }

  _createObject(headers, body) {
    var self = this;
    let output = body.map((row, index) => {
      let data = self._splitLine(row);
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
  }
}
