/**
 * Created by Nekrasov on 05.04.2017.
 */
(function () {
    "use strict";
    class FilterFooterController {

        constructor($scope, $http, settings, $state, $rootScope) {
            let self = this;
            self.Result = $state.params.Organizations;
        }

    }
    FilterFooterController.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope'];
    angular.module('app').controller('filterFooterController', FilterFooterController);
})();