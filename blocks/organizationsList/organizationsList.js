﻿(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $linq, organizationService) {

        // if ($rootScope.organizations === undefined) {
        //     let event = $rootScope.$on('floorLoad', function () {
        //         filter();
        //         event();
        //     });
        //
        // }
        // else {
        //     filter();
        // }
        //
        // function filter() {
        //     let categoryID = $stateParams.CategoryID;
        //     $scope.searchText = $stateParams.Filter == undefined ? "" : $stateParams.Filter.toLowerCase();
        //     var tmp = $rootScope.organizations;
        //     var tmpCat = $rootScope.categories;
        //     if ($scope.searchText) {
        //         var tmpCatIds = [];
        //         angular.forEach(tmpCat, function (item) {
        //             if (item.Name && item.Name.toLowerCase().includes($scope.searchText))
        //                 tmpCatIds.push(item.CategoryID);
        //         });
        //
        //         let ln = $linq.Enumerable().From(tmpCatIds);
        //         tmp = tmp.filter(item => {
        //             return (item.Name && item.Name.toLowerCase().includes($scope.searchText)) || (item.KeyWords && item.KeyWords.toLowerCase().includes($scope.searchText)) || ln.Intersect(item.CategoryOrganization.map(i => i.CategoryID)).Count() !== 0;
        //         });
        //
        //     }
        //     $rootScope.otherCurrentOrganizations = tmp;
        //
        //     if (categoryID && categoryID != -1) {
        //         categoryID = parseInt(categoryID);
        //
        //         let cats = $rootScope.categories.find(i => i.CategoryID == categoryID).ChildrenIds;
        //         cats.push(categoryID);
        //         let ln = $linq.Enumerable().From(cats);
        //         tmp = tmp.filter(item => {
        //             return ln.Intersect(item.CategoryOrganization.map(i => i.CategoryID)).Count() !== 0;
        //         });
        //     }
        //
        //     $rootScope.currentOrganizations = tmp;
        //     $state.go($state.current.name, {Organizations: tmp, CategoryID: categoryID});
        //
        // };
        function filter() {
            organizationService.getFilter($state.params.Filter, $state.params.CategoryID).then(i => {
                $rootScope.otherCurrentOrganizations = i.Other;
                $rootScope.currentOrganizations = i.Result;
                $state.go($state.current.name, {Organizations: i.Result, CategoryID: $state.params.CategoryID});
            });
        }
        filter();

        $scope.home = function () {
            $state.go('navigation.mainMenu');
        };
        $scope.select = function (item) {
            $state.go('navigation.organization', {
                OrganizationID: item.OrganizationID,
                Filter: $stateParams.Filter,
                CategoryID: $stateParams.CategoryID
            }, {inherit: true});
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
                };
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
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$linq', 'organizationService'];
    angular.module('app').controller('organizationsListController', controller);
})();