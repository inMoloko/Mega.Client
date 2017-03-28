(function () {
    'use strict';
    var service = function ($http, $q, settings) {
        this.$http = $http;
        this.$q = $q;
        this.settings = settings;
    };
    service.prototype.get = function (id) {
        let deferred = this.$q.defer();
        this.$http.get(this.settings.webApiBaseUrl + `/Proposal/GetById/${id}`).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    service.prototype.getAll = function () {
        let dt = new Date().toISOString();
        var filter = `(DateEnd ge DateTime'${dt}' or DateEnd eq null) and (DateBegin le DateTime'${dt}' or DateBegin eq null)`;
        return this.$http.get(this.settings.webApiBaseUrl + `/Proposal?$expand=Organization&$select=ProposalID,DateBegin,DateEnd,Name,Summary,Organization/Name&$filter=${filter}&CustomerID=${this.settings.customerID}`).then(function (data) {
            return data.data;
        });
    };
    service.prototype.getFilter = function (term) {
        return this.$http.get(this.settings.webApiBaseUrl + `/Proposal/GetFilter?CustomerID=${this.settings.customerID}&term=${term}`, {cache: true}).then(function (data) {
            return data.data;
        });
    };
    service.prototype.getByOrganization = function (id) {
        let deferred = this.$q.defer();
        let dt = new Date().toISOString();
        let filter = `OrganizationID eq ${id} and DateEnd ge DateTime'${dt}' and DateBegin le DateTime'${dt}'`;
        this.$http.get(this.settings.webApiBaseUrl + `/Proposal?$select=ProposalID,DateBegin,DateEnd,Name,Summary&$filter=${filter}`).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    angular
        .module('app')
        .service('proposalService', service);

    service.$inject = ['$http', '$q', 'settings'];
})();