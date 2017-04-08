(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, organizationService, $linq, mainMenuService) {
        var self = this;
        self.$rootScope = $rootScope;

        organizationService.get($state.params.OrganizationID).then(i => {
            self.item = i;

            // let cats = self.item.Categories.map(i => i.CategoryID);
            // if (cats.length > 1)
            //     return;
            // let ids = self.$rootScope.categories.find(i => i.CategoryID == self.menuItems['Сервисы']).ChildrenIds;
            // if (ids.includes(cats[0])) {
            //     return "Сервисы";
            // }
            // ids = self.$rootScope.categories.find(i => i.CategoryID == self.menuItems['Рестораны и кафе']).ChildrenIds;
            // if (ids.includes(cats[0])) {
            //     self.default = '/Content/images/card_food_cover_holder.png';
            //     self.logoDefault = '/Content/images/card_food_logo_holder.png';
            // }
            // ids = self.$rootScope.categories.find(i => i.CategoryID == self.menuItems['Развлечения и услуги']).ChildrenIds;
            // if (ids.includes(cats[0])) {
            //     self.default = '/Content/images/list_enterteinment_cover_holder.png';
            //     self.logoDefault = '/Content/images/card_enterteinment_logo_holder.png';
            // }

        });
        mainMenuService.get().then(i => {
            self.menuItems = i;
        });
        self.default = 'Content/images/card_shop_cover_holder.png';
        self.logoDefault = 'Content/images/card_shop_logo_holder.png';
        // if ($state.current.name) {
        //     if ($state.current.name.includes("favoriteSearch")) {
        //
        //     } else {
        //         if ($state.current.name.includes("shop")) {
        //             self.default = '/Content/images/card_shop_cover_holder.png';
        //             self.logoDefault = '/Content/images/card_shop_logo_holder.png';
        //         }
        //         if ($state.current.name.includes("restaurant")) {
        //             self.default = '/Content/images/card_food_cover_holder.png';
        //             self.logoDefault = '/Content/images/card_food_logo_holder.png';
        //         }
        //     }
        // }
    };

    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', 'organizationService', '$linq', 'mainMenuService'];
    angular.module('app').controller('shopController', controller);
})();