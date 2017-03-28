/**
 * Created by Nekrasov on 17.03.2017.
 */
(function () {
    "use strict";
    let controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $timeout) {
        let self = this;
        self._$state = $state;
        self._$rootScope = $rootScope;
        self.favorites = [
            'одежда',
            'туалет',
            'Ашан',
            'Adidas',
        ];
    };
    controller.prototype.select = function (term) {
        let self = this;
        self._$rootScope.currentFilter = term;
        self._$state.go('.searchResult', {
            CategoryID: self._$rootScope.currentCategory ? self._$rootScope.currentCategory.CategoryID : undefined,
            Filter: self._$rootScope.currentFilter
        }, {
            reload: false,
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$timeout'];
    angular.module('app').controller('favoriteSearchController', controller);
})();