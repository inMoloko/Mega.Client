/**
 * Created by Nekrasov on 22.03.2017.
 */
(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $linq) {
        this.$state = $state;

    };
    controller.prototype.goBack = function () {
        this.$state.go("^");
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$linq'];
    angular.module('app').controller('shopHeadingController', controller);
})();