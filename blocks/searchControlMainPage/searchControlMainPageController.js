/**
 * Created by Nekrasov on 17.03.2017.
 */
(function () {
    "use strict";
    let controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $timeout, dbService) {
        let self = this;
        self._dbService = dbService;
        self._$state = $state;

        dbService.getData().then(data => {
            self.Customer = data.Customer;
        });
    };
    controller.prototype.goSearch = function () {
        let self = this;
        self._$state.go('navigation.favoriteSearch');
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$timeout', 'dbService'];
    angular.module('app').controller('searchControlMainPageController', controller);
})();