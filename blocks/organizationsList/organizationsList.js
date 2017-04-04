(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $linq, organizationService, mainMenuService) {

        this.$rootScope = $rootScope;

        function filter() {
            organizationService.getFilter($state.params.Filter, $state.params.CategoryID).then(i => {
                $rootScope.otherCurrentOrganizations = i.Other;
                $rootScope.currentOrganizations = i.Result;
                $state.go($state.current.name, {Organizations: i.Result, CategoryID: $state.params.CategoryID});
            });
        }

        filter();
        mainMenuService.get().then(i => {
            $scope.menuItems = i;
        });
        $scope.home = function () {
            $state.go('navigation.mainMenu');
        };
        $scope.select = function (item) {
            let categoryID = item.Categories[0];
            let value = $scope.menuItems['Рестораны и кафе'];
            let cats = $rootScope.categories.find(i => i.CategoryID == value).ChildrenIds;
            if ($linq.Enumerable().From(item.Categories).Select(i => i.CategoryID).Intersect(cats).Count() != 0) {
                $state.go(".restaurant", {
                    OrganizationID: item.OrganizationID
                });
                return;
            }
            value = $scope.menuItems['Развлечения и услуги'];
            cats = $rootScope.categories.find(i => i.CategoryID == value).ChildrenIds;
            if ($linq.Enumerable().From(item.Categories).Select(i => i.CategoryID).Intersect(cats).Count() != 0) {
                $state.go(".entertainment", {
                    OrganizationID: item.OrganizationID
                });
                return;
            }
            value = $scope.menuItems['Сервисы'];
            cats = $rootScope.categories.find(i => i.CategoryID == value).ChildrenIds;
            if ($linq.Enumerable().From(item.Categories).Select(i => i.CategoryID).Intersect(cats).Count() != 0) {
                $state.go(".service", {
                    OrganizationID: item.OrganizationID
                });
                return;
            }
            $state.go(".organization", {
                OrganizationID: item.OrganizationID
            });
        };
        // $scope.megacard = function (item) {
        //     // CategoryOrganization[0].CategoryID
        //     return item.CategoryOrganization.map(i => i.CategoryID).includes(1704);
        // };
        //$scope.hide = function () {
        //    $state.go("navigation.closedResult", { CategoryID: $stateParams.CategoryID, Filter: $stateParams.Filter, OrganizationType: $stateParams.OrganizationType });
        //};
        $scope.hide = function () {
            $rootScope.currentStateName = $state.current.name;
            $rootScope.currentStateParam = $state.params;
            $rootScope.closeResultTitle = 'Найдено ' + $rootScope.currentOrganizations.length;
            $state.go("navigation.closedResult", {
                CategoryID: $stateParams.CategoryID,
                Filter: $stateParams.Filter,
                OrganizationType: $stateParams.OrganizationType
            });
        };
        let stateChangeHandler = $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'navigation.searchResult' && fromState.name === 'navigation.searchResult.organization') {
                    $rootScope.currentOrganization = undefined;
                    filter();
                }
                ;
            });
        // $scope.$watch("$state.params", function (n, o) {
        //    console.log(n,o);
        // });
        $scope.$on("$destroy", function () {
            stateChangeHandler();
            locationChangeHandler();
        });
        let locationChangeHandler = $scope.$on('$locationChangeSuccess', function () {
            filter();
        });
        $scope.getFloors = function (item) {
            if (!item)
                return;
            return $linq.Enumerable().From(item.OrganizationMapObject).Select(i => $rootScope.floorsDic[i.MapObject.FloorID].Number).Distinct().ToArray().join(',');
            // return item.OrganizationMapObject.map(i => {
            //     return $rootScope.floorsDic[i.MapObject.FloorID].Number;
            // }).join(',');
        };
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$linq', 'organizationService', 'mainMenuService'];
    angular.module('app').controller('organizationsListController', controller);
})();