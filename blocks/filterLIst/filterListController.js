/**
 * Created by Nekrasov on 05.04.2017.
 */
(function () {
    "use strict";
    class FilterListController {

        constructor($scope, $http, settings, $state, $rootScope) {
            let self = this;

            self.$state = $state;

            $rootScope.currentOrganizations = $state.params.Organizations;

            $scope.select = function (item) {
                $state.go(".organization", {OrganizationID: item.OrganizationID});
            };

            if ($state.current.name.includes('shop')) {
                self.filterName = 'shopFilter';
                self.list = 'navigation.shops';
            } else if ($state.current.name.includes('restaurant')) {
                self.filterName = 'restaurantFilter';
                self.list = 'navigation.restaurants';
            } else if ($state.current.name.includes('entertainment')) {
                self.filterName = 'entertainmentFilter';
                self.list = 'navigation.entertainments';
            }


            if (!$state.params[self.filterName]) {
                self.filter = '';
            } else {
                let tmp = [];
                let categories = $state.params[self.filterName].Categories.filter(i => i.select == true);
                if (categories.length != 0) {
                    tmp = categories.map(i => i.Name);
                }

                if ($state.params[self.filterName].HasProposals) {
                    tmp.unshift('Акции');
                }
                self.filter = tmp.join('/');
            }
        }

        clean() {
            let self = this;
            self.$state.go(self.list, {[self.filterName]: null});
        }
    }
    FilterListController.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope'];
    angular.module('app').controller('filterListController', FilterListController);
})();