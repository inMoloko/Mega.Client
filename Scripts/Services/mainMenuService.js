(function () {
    'use strict';
    var service = function ($rootScope, $http, settings) {
        this._$http = $http;
        this._settings = settings;
    };
    service.prototype.get = function () {
        var self = this;
        if (!self.promise) {
        } else self.promise;
        self.promise = self._$http.get(`${self._settings.webApiBaseUrl}/SystemSetting/MenuItems?CustomerID=${self._settings.customerID}`).then(function (response) {
            return response.data;
        });
        return self.promise;
    };
    service.$inject = ['$rootScope', '$http', 'settings'];
    angular.module('app').service('mainMenuService', service);
})();