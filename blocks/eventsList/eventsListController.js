/**
 * Created by Nekrasov on 20.03.2017.
 */
(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, eventService) {
        var self = this;
        self.filter = $state.params.Filter;
        eventService.getFilter($state.params.Filter).then(i => {
            self.items = i;
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'eventService'];
    angular.module('app').controller('eventsListController', controller);
})();