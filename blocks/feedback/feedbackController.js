(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, eventService) {
        var self = this;
        self.$state = $state;
        self.item = {};
        self.ratings = [1, 2, 3, 4, 5];

        var $firstInput = $('#filter');
        $firstInput.focus();
        jsKeyboard.currentElement = $firstInput;
        jsKeyboard.currentElement.val($state.params.Filter);
        jsKeyboard.currentElementCursorPosition = $firstInput.val().length || 0;
        $firstInput.bind('writeKeyboard', function (event, a) {
            self.item.text = $firstInput.val();
            $scope.$apply();
        });
        jsKeyboard.show();

        $scope.$on('$destroy', function () {
            jsKeyboard.hide();
            $('#filter').unbind();
        });

    };
    controller.prototype.submit = function () {
        var self = this;
        self.$state.go(".final", {feedback: self.item});

    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'eventService'];
    angular.module('app').controller('feedbackController', controller);
})();