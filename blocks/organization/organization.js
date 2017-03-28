(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, organizationService, $linq) {
        var self = this;
        organizationService.get($state.params.OrganizationID).then(i => {
            self.item = i;
        });

    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', 'organizationService', '$linq'];
    angular.module('app').controller('organizationController', controller);
})();