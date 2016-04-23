const GTFSVersion = '1';
const GTFSFiles = [{'file': 'agency',
  'key': 'agency_id'},
  {'file': 'calendar_dates',
    'key': ''},
  {'file': 'calendar',
    'key': 'service_id'},
  {'file': 'routes',
    'key': 'route_id'},
  {'file': 'shapes',
    'key': 'shape_id'},
  {'file': 'stop_times',
    'key': 'trip_id'},
  {'file': 'stops',
    'key': 'stop_id'},
  {'file': 'trips',
    'key': 'trip_id'}];

function loadDataFromGTFS() {
  return Promise.all(GTFSFiles.map((file) => {
    return getObjectsFromCSVFile(`../data/${file.file}.txt`)
    .then((data) => {
      return openDatabase().then((db) => {
        let tx = db.transaction(file.file, 'readwrite');
        switch (file.file) {
          case 'trips':
          case 'routes':
            data.forEach((item) => {
              if (item.route_id > 7999) {
                tx.objectStore(file.file).add(item);
              }
            });
            break;
          case 'stops':
            data.forEach((item) => {
              // Add anything with station in the title
              // That's overdoing it by a few stops but shouldn't be a problem
              if (item.stop_name.indexOf('STATION') !== -1) {
                tx.objectStore('stops').add(item);
              }
            });
            break;
          case 'shapes':
            // This is huge and we don't need it yet
            break;
          case 'stop_times':
            break;
          default:
            data.forEach((item) => {
              tx.objectStore(file.file).add(item);
            });
        }
        return tx.complete;
      });
    });
  }))
  .then(() => {
    return openDatabase().then((db) => {
      let tx = db.transaction('meta', 'readwrite');
      tx.objectStore('meta').add(GTFSVersion, 'version');
      console.log('done loading data');
      return tx.complete;
    });
  })
  .catch((e) => {
    console.log('error', e);
  });
}


function openDatabase() {
  return idb.open('marta-offline', 1, (upgradeDB) => {
    switch (upgradeDB.oldVersion) {
      case 0:
        upgradeDB.createObjectStore('meta');
        GTFSFiles.forEach((file) => {
          let options = {};
          if (file.key) {
            options.keyPath = file.key;
          } else {
            options.autoIncrement = true;
          }
          upgradeDB.createObjectStore(file.file, options);
        });
    }
  });
}

/*
 * @param file {string} The file to convert
 * @return {Promise} Promise resolving to object parsed from CSV file
 */
function getObjectsFromCSVFile(file) {
  return fetch(file)
  .then((response) => {
    return response.text();
  })
  .then((text) => {
    return new Promise((resolve, reject) => {
      let parse = new ParseCSV();
      try {
        resolve(parse.parse(text));
      } catch (e) {
        reject(e);
      }
    });
  });
}
