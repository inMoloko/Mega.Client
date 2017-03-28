(function () {
    'use strict';
    var service = function ($http, $q, settings) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
    };
    service.prototype.get = function (id) {
        return this.$http.get(this.settings.webApiBaseUrl + '/Organization/GetDetail/' + id).then(i => i.data);

    };
    service.prototype.getFilter = function (filter = '', categoryID = '') {
        return this.$http.get(this.settings.webApiBaseUrl + '/Organization/GetFilter?CustomerID=' + this.settings.customerID + '&Filter=' + filter + '&CategoryID=' + categoryID, {cache: true}).then(i => i.data);
    };
    angular
        .module('app')
        .service('organizationService', service);

    service.$inject = ['$http', '$q', 'settings'];
})();