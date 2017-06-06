/**
 * Created by Nekrasov on 22.03.2017.
 */
(function () {
    'use strict';
    var service = function ($http, $q, settings, dbService, $linq) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
        this.dbService = dbService;
        this.$linq = $linq;
    };
    service.prototype.getCurrent = function () {
        if (this.promise)
            return this.promise;
        this.promise = this.$http.get(this.settings.webApiBaseUrl + '/Event/GetCurrent?CustomerID=' + this.settings.customerID).then(i => i.data);
        return this.promise;
    };
    service.prototype.getFilter = function (term) {
        let self = this;
        //return this.$http.get(this.settings.webApiBaseUrl + '/Event/GetFilter?CustomerID=' + this.settings.customerID + '&term=' + (term || '')).then(i => i.data);
        return self.dbService.getData().then(data => {
            let result = self.$linq.Enumerable().From(data.Events).Select(i => i.Value)
                .Where(i => (i.DateBegin === null && i.DateEnd === null) || (moment(i.DateBegin).isBefore()) && (moment(i.DateEnd).isAfter()));
            if (term) {
                term = term.toLowerCase();
                result = result.Where(i => (i.Name && i.Name.toLocaleLowerCase().includes(term))
                || (i.KeyWords && i.KeyWords.toLocaleLowerCase().includes(term))
                || (i.Summary && i.Summary.toLocaleLowerCase().includes(term))
                || (i.Description && i.Description.toLocaleLowerCase().includes(term)))
            }
            return result.OrderBy(i=>i.DateEnd).ToArray();
        });
    };
    service.prototype.get = function (id) {
        //return this.$http.get(this.settings.webApiBaseUrl + '/Event/GetById/' + id + '?CustomerID=' + this.settings.customerID).then(i => i.data);
        let self = this;
        return self.dbService.getData().then(data => data.Events[id]);
    };
    angular
        .module('app')
        .service('eventService', service);

    service.$inject = ['$http', '$q', 'settings', 'dbService', '$linq'];
})();