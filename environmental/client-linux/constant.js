(function () {
    "use strict";
    let app = angular.module('app');
    let queryDict = {};
    let encoded = location.search.replace(/&amp;/g, '&');
    encoded.substr(1).split("&").forEach(function (item) {
        queryDict[item.split("=")[0]] = decodeURI(item.split("=")[1]);
    });
    app.constant('settings', {
        //Скорость человечка
        manVelocity: 10,
        //Дельта смещения точки прикосновения. Если смещение меньше дельты - срабатывает событие клик
        deltaDistanceTouchMoveAsClick: 100,
        customerID: queryDict.CustomerID,
        terminalID: queryDict.TerminalID,
        serialNumber: queryDict.SerialNumber,
        token:queryDict.Token,
        displayKeyboard: true,
        preventDbCheck: true,
        preventStatistic: true,
        autoReset: true,
        mapScale: 1,
        resourceFolder: 'variable-content', //'Content/Backup',
        dbPath: `variable-content/Db/${queryDict.SerialNumber}.json`,
        useGeo:true
    });
})();
