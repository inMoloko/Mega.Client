(function () {
    "use strict";

    class OrganizationsListController {
        constructor($scope, $http, settings, $rootScope, $state, $stateParams, $linq, organizationService, mainMenuService, dbService, $timeout) {
            let self = this;
            self.$state = $state;
            self.dbService = dbService;


            this.$rootScope = $rootScope;

            self.executeFilter();
            // mainMenuService.get().then(i => {
            //     $scope.menuItems = i;
            // });
            dbService.systemSettingGetMenuItems().then(i => {
                $scope.menuItems = i;
            });

            let stateChangeHandler = $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    if (toState.name === 'navigation.searchResult' && fromState.name === 'navigation.searchResult.organization') {
                        $rootScope.currentOrganization = undefined;
                        self.executeFilter();
                    }
                });
            $scope.$on("$destroy", function () {
                stateChangeHandler();
                locationChangeHandler();
            });
            let locationChangeHandler = $scope.$on('$locationChangeSuccess', function () {
                self.executeFilter();
            });
            // $timeout(()=>{
            //    $("ul.list-group.organizationsList__organizationsSearchResultBlock").mCustomScrollbar({callbacks:{
            //        whileScrolling:function(e){
            //            console.log("Scrolling...", e);
            //        }
            //    }});
            // });
        }

        executeFilter() {
            // console.time('executeFilter');
            let self = this;
            self.searchText = self.$state.params.Filter;
            self.dbService.organizationGetFilter(self.$state.params.Filter, self.$state.params.CategoryID).then(i => {
                self.currentOrganizations = i;
                self.$state.go(self.$state.current.name, {Organizations: i, CategoryID: self.$state.params.CategoryID});
                // console.timeEnd('executeFilter');
            });
        }

        select(item) {
            let self = this;
            self.dbService.getData().then(data => {
                let type = self.dbService.getOrganizationTypeSync(data, item);
                self.$state.go("." + type, {
                    OrganizationID: item.OrganizationID,
                    CategoryID: self.dbService.categoryGetByTypeSync(data, type).CategoryID
                });
            });
            return;
        };
    }

    OrganizationsListController.$inject = ['$scope', '$http', 'settings', '$rootScope', '$state', '$stateParams', '$linq', 'organizationService', 'mainMenuService', 'dbService','$timeout'];
    angular.module('app').controller('organizationsListController', OrganizationsListController);
})();