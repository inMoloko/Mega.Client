(function () {
    'use strict';
    var service = function ($rootScope, $http, settings) {
        this._$http = $http;
        this._settings = settings;
    };
    service.prototype.post = function () {
        var self = this;
    };
    service.$inject = ['$rootScope', '$http', 'settings'];
    angular.module('app').service('mainMenuService', service);
})();