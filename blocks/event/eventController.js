(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, eventService) {
        var self = this;
        eventService.get($state.params.EventID).then(i => {
            self.item = i;
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'eventService'];
    angular.module('app').controller('eventController', controller);
})();