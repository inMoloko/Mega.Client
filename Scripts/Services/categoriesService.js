/**
 * Created by Nekrasov on 04.04.2017.
 */
(function () {
    'use strict';
    class CategoryService {
        constructor($http, $q, settings) {
            this.$http = $http;
            this.settings = settings;
        }

        getFilterCategories(categoryID) {
            return this.$http.get(this.settings.webApiBaseUrl + '/Category/GetFilterCategories?CategoryID=' + categoryID, {cache: true}).then(i => i.data);
        }

        getAllRecursive() {
            return this.$http.get(this.settings.webApiBaseUrl + '/Category/GetAllRecursive?CustomerID=' + this.settings.customerID, {cache: true}).then(i => i.data);
        }
    }
    angular
        .module('app')
        .service('categoryService', CategoryService);

    CategoryService.$inject = ['$http', '$q', 'settings'];
})();