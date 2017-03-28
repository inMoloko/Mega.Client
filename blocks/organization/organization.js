(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, organizationService, $linq) {
        var self = this;
        organizationService.get($state.params.OrganizationID).then(i => {
            self.item = i;
        });
        self.default = '/Content/images/card_shop_cover_holder.png';
        self.logoDefault = '/Content/images/card_shop_logo_holder.png';
        if ($state.current.name) {
            if ($state.current.name.includes("shop")) {
                self.default = '/Content/images/card_shop_cover_holder.png';
                self.logoDefault = '/Content/images/card_shop_logo_holder.png';
            }
            if ($state.current.name.includes("restaurant")) {
                self.default = '/Content/images/card_food_cover_holder.png';
                self.logoDefault = '/Content/images/card_food_logo_holder.png';
            }
        }
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', 'organizationService', '$linq'];
    angular.module('app').controller('organizationController', controller);
})();