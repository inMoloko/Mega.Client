(function () {
    'use strict';
    var controller = function ($scope, $rootScope, $http, settings) {

        $http.get(settings.webApiBaseUrl + '/TransportRoute?$expand=TransportType&CustomerID=' + settings.customerID).then(function (data) {
            $scope.items = data.data;
        });
        $rootScope.selectPageName = "КАК ДОБРАТЬСЯ";
    };

    angular
        .module('app')
        .controller('transportController', controller);

    controller.$inject = ['$scope', '$rootScope', '$http', 'settings'];

})();