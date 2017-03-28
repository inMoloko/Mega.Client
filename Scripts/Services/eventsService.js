/**
 * Created by Nekrasov on 22.03.2017.
 */
(function () {
    'use strict';
    var service = function ($http, $q, settings) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
    };
    service.prototype.getCurrent = function () {
        if (this.promise)
            return this.promise;
        this.promise = this.$http.get(this.settings.webApiBaseUrl + '/Event/GetCurrent?CustomerID=' + this.settings.customerID).then(i => i.data);
        return this.promise;
    };
    service.prototype.getFilter = function (term) {
        return this.$http.get(this.settings.webApiBaseUrl + '/Event/GetFilter?CustomerID=' + this.settings.customerID + '&term=' + (term || '')).then(i => i.data);
    };
    service.prototype.get = function (id) {
        return this.$http.get(this.settings.webApiBaseUrl + '/Event/GetById/' + id + '?CustomerID=' + this.settings.customerID).then(i => i.data);
    };
    angular
        .module('app')
        .service('eventService', service);

    service.$inject = ['$http', '$q', 'settings'];
})();