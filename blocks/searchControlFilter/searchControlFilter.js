/**
 * Created by Nekrasov on 17.03.2017.
 */
(function () {
    "use strict";
    let controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $timeout) {
        let self = this;
        self._$state = $state;
        self._$rootScope = $rootScope;

        //self._$rootScope.currentFilter = $state.Filter;

        $scope.$watch("currentFilter", function (n, o) {
            if (n == o)
                return;
            if ($state.current.name == "navigation.mainMenu" && $rootScope.currentFilter == undefined)
                return;
            if(!$state.current.name.includes("searchResult")) {
                $state.go('.searchResult', {
                    CategoryID: $state.params.CategoryID,
                    Filter: $rootScope.currentFilter
                }, {reload: true});
                return;
            }
            $state.go('.', {CategoryID: $state.params.CategoryID, Filter: $rootScope.currentFilter}, {reload: false});

        });
        var $firstInput = $('#filter');
        $firstInput.focus();
        jsKeyboard.currentElement = $firstInput;
        jsKeyboard.currentElement.val($state.params.Filter);
        jsKeyboard.currentElementCursorPosition = $firstInput.val().length || 0;
        $firstInput.bind('writeKeyboard', function (event, a) {
            $rootScope.currentFilter = $firstInput.val();
            console.log('enter keys');
            $scope.$apply();
        });
        jsKeyboard.show();

        $scope.$on('$destroy', function () {
            jsKeyboard.hide();
            $('#filter').unbind();
            console.log('unbind');
        });
    };
    controller.prototype.change = function () {
        console.log('change');
    };
    controller.prototype.refresh = function () {
        console.log('refresh');
    };
    controller.prototype.goSearch = function () {
        let self = this;
        self._$state.go('navigation.searchResult');
    };
    controller.prototype.goBack = function () {
        let self = this;
        self._$rootScope.currentFilter = null;
        self._$state.go('navigation.mainMenu');
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$timeout'];
    angular.module('app').controller('searchControlFilterController', controller);
})();