/**
 * Created by Nekrasov on 20.03.2017.
 */
(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, mainMenuService, $stateParams, $q, Idle) {
        mainMenuService.get().then(function (result) {
            $scope.menuItems = result;
        });
        function getClass(route, params) {
            if (!route) {
                $scope.themClass = 'main';
                return;
            }
            if (route.includes('shops') || route == "navigation.organization") {
                $scope.themClass = 'shops';
                return;
            }
            if (route.includes('restaurant')) {
                $scope.themClass = 'food';
                return;
            }
            if (route.includes('proposal')) {
                $scope.themClass = 'proposals';
                return;
            }
            if (route.includes('more') || route.includes('event') || route.includes('service')|| route.includes('entertainment')) {
                $scope.themClass = 'more';
                return;
            }
            $scope.themClass = 'main';
            return;

            switch (route) {
                case "navigation":
                    $scope.themClass = 'main';
                    break;
                case "navigation.shops":
                case "navigation.organization":
                    $scope.themClass = 'shops';
                    break;
                case "navigation.searchResult":
                    if (params.CategoryID == $scope.menuItems['Магазины']) {
                        $scope.themClass = 'shops';
                    }
                    if (params.CategoryID == $scope.menuItems['Рестораны и кафе']) {
                        $scope.themClass = 'food';
                    }
                    break;
                case "navigation.restaurants":
                    $scope.themClass = 'food';
                    break;
                case "navigation.proposals":
                    $scope.themClass = 'proposals';
                    break;
                default:
                    $scope.themClass = 'main';
                    break;

            }
        }

        getClass($state.current.name, $stateParams);

        let locationChangeHandler = $rootScope.$on('$locationChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            getClass($state.current.name, $stateParams);
        });
        $scope.selectItem = function (obj) {
            if (obj == 'shops') {
                var value = $scope.menuItems['Магазины'];
                $state.go('navigation.shops', {CategoryID: value});
                return;
            }
            if (obj == 'restaurants') {
                var value = $scope.menuItems['Рестораны и кафе'];
                $state.go('navigation.restaurants', {CategoryID: value});
                return;
            }
            if (obj == 'entertainments') {
                var value = $scope.menuItems['Развлечения и услуги'];
                $state.go('navigation.searchResult', {CategoryID: value});
                return;
            }
            if (obj == 'proposals') {
                $state.go('navigation.proposals', {CategoryID: value});
                return;
            }
        };

        $scope.$on('$destroy', function () {
            locationChangeHandler();
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'mainMenuService', '$stateParams', '$q', 'Idle'];
    angular.module('app').controller('navigationController', controller);
})();