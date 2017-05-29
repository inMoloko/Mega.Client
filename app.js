(function () {
    "use strict";
    let app = angular.module('app', ['ui.router', 'ngIdle', 'angular-linq', 'ngScrollbars', 'indexedDB']);
    app.config(function ($indexedDBProvider) {
        $indexedDBProvider.connection('localDb')
            .upgradeDatabase(1, function (event, db, tx) {
                let objStore = db.createObjectStore('statistics', {keyPath: 'Date'});

            });
    });
})();
