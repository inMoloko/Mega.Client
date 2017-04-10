(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, organizationService, $linq, mainMenuService) {
        var self = this;
        self.$rootScope = $rootScope;

        organizationService.get($state.params.OrganizationID).then(i => {
            self.item = i;

        });
        mainMenuService.get().then(i => {
            self.menuItems = i;
        });
        self.default = 'Content/images/card_shop_cover_holder.png';
        self.logoDefault = 'Content/images/card_shop_logo_holder.png';
    };

    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', 'organizationService', '$linq', 'mainMenuService'];
    angular.module('app').controller('shopController', controller);
})();