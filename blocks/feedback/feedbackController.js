(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, eventService) {
        var self = this;
        self.$state = $state;
        self.item = {};
        self.ratings = [1, 2, 3, 4, 5];
    };
    controller.prototype.submit = function () {
        var self = this;
        self.$state.go(".final", {feedback: self.item});

    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'eventService'];
    angular.module('app').controller('feedbackController', controller);
})();