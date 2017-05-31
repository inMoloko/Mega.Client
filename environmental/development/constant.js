(function () {
    "use strict";
    let app = angular.module('app');
    let queryDict = {};
    location.search.substr(1).split("&").forEach(function (item) {
        queryDict[item.split("=")[0]] = decodeURI(item.split("=")[1]);
    });
    app.constant('settings', {
        webApiBaseUrl: 'http://localhost:51147/api',
        authUrl: 'http://localhost:51147',
        webApiODataUrl: 'http://localhost:5555/odata',
        //Скорость человечка
        manVelocity: 30,
        //Дельта смещения точки прикосновения. Если смещение меньше дельты - срабатывает событие клик
        deltaDistanceTouchMoveAsClick: 100,
        customerID: queryDict.CustomerID,
        terminalID: queryDict.TerminalID,
        serialNumber: queryDict.SerialNumber,
        token: queryDict.Token,
        displayKeyboard: true,
        autoReset: true,
        mapScale: 4,
        resourceFolder: 'Content/Backup',
        dbPath: `Content/Backup/db/${queryDict.SerialNumber}.json`
    });
})();
