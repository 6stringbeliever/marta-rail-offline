const MARTA_RAIL_API_KEY = 'dfb28bb9-5860-4964-b798-9e4f5dc0bcc7';
const MARTA_RAIL_API_URL = `http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=${MARTA_RAIL_API_KEY}`;

(function() {
  'use strict';

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function(reg) {
      console.log(`Service Worker registered at ${reg.scope}`);
    })
    .catch(function(err) {
      console.log('Unable to register Service Worker.', err);
    });
  }
})();

var martaOfflineApp = angular.module('martaOfflineApp', []);

martaOfflineApp.controller('StartLineController', ($scope) => {
  $scope.processing = true;
  $scope.routes = [];
  openDatabase()
  .then((db) => {
    let tx = db.transaction('meta');
    return tx.objectStore('meta').get('version');
  })
  .then((ver) => {
    if (!ver || ver < GTFSVersion) {
      $scope.$apply(() => { $scope.processing = true; });
      return loadDataFromGTFS();
    } else {
      return;
    }
  }).then(() => {
    $scope.$apply(() => { $scope.processing = false; });
    return openDatabase().then((db) => {
      return db.transaction('routes');
    });
  }).then((tx) => {
    tx.objectStore('routes').getAll().then((routes) => {
      $scope.$apply(() => { $scope.routes = routes; });
    });
  })
  .catch((e) => {
    console.log(`Error: ${e}`);
  });
});
