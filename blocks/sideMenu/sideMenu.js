(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $rootScope, $state, $stateParams, $timeout, mainMenuService, eventService) {
        let swiper;

        eventService.getCurrent().then(function(proposals){
            // angular.forEach(proposals, (i, k) => {
            //     swiper.appendSlide(`<a class="swiper-slide" href="#/navigation/more/events/event/${i}" style="background-image:url('${settings.webApiBaseUrl}/Event/${i}/WideLogo');"></a>`);
            //     // swiper.appendSlide(`<div class="swiper-slide"></div>`);
            // });
            $scope.events = proposals;
            $timeout(function () {
                swiperInit();
            });
        });

        function swiperInit() {
            swiper = new Swiper('#swiper-container', {
                centeredSlides: true,
                autoplay: 2000,
                autoplayDisableOnInteraction: false,
                loop: true
            });
        }

        //if ($state.current.name === 'navigation.mainMenu') {
        if (!$rootScope.horizontalBanners) {
            let event = $rootScope.$on('proposalsLoaded', function () {
                //swiperInit();
                event();
            });
        } else {
            //swiperInit();
        }
        //}

        mainMenuService.get().then(function (result) {
            $scope.menuItems = result;
        });

        $scope.getImage = function (i) {
            return `${settings.webApiBaseUrl}/Event/${i}/WideLogo`;
        };
        // $scope.sizeMenuItem = function () {
        //     if ($('#sideMenu').height() > 600)
        //         return "menuItemFull";
        //     else if ($('#sideMenu').height() > 420)
        //         return "menuItemSmall";
        //     else
        //         return "menuItemVerrySmall";
        // };
        //
        // $scope.visibleMenuItemName = function () {
        //     if ($('#sideMenu').height() < 420)
        //         return true;
        // };

        $scope.listAnchorLength = "Empty";

        $rootScope.$watch('anchorOrganizations', function () {
            if ($rootScope.anchorOrganizations && $rootScope.anchorOrganizations.length > 0)
                $scope.listAnchorLength = "NotEmpty";
        });

        $scope.goScheduleControl = function () {
            if ($scope.listAnchorLength == "NotEmpty")
                $state.go('navigation.shedule', {});
        };
        $scope.selectItem = function (obj) {
            if (obj == 'shops') {
                var value = $scope.menuItems['Магазины'];
                $state.go('navigation.shops', {CategoryID: value});
                return;
            }
            if (obj == 'restaurants') {
                var value = $scope.menuItems['Рестораны и кафе'];
                $state.go('navigation.restaurants', {CategoryID: value});
                return;
            }
            if (obj == 'entertainments') {
                var value = $scope.menuItems['Развлечения и услуги'];
                $state.go('navigation.entertainments', {CategoryID: value});
                return;
            }
            if(obj == 'proposals'){
                $state.go('navigation.proposals');
                return;
            }
            if(obj == 'services'){
                var value = $scope.menuItems['Сервисы'];
                $state.go('navigation.services', {CategoryID: value});
                return;
            }
            // if (obj.type == 'category')
            //     $state.go('navigation.searchResult', {CategoryID: obj.CategoryID});
            // if (obj.type == 'organization')
            //     $state.go('navigation.searchResult.organization', {OrganizationID: obj.OrganizationID});
        };
        $scope.$on('$destroy', function () {
            if (swiper)
                swiper.destroy();
        });
    };
    controller.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$timeout', 'mainMenuService' ,'eventService'];
    angular.module('app').controller('sideMenuController', controller);
})();