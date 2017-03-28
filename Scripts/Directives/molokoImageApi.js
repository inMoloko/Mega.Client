(function () {
    "use strict";
    angular.module('app').directive("molokoImageApi", ['settings', '$parse', '$rootScope', function (settings, $parse, $rootScope) {
        return {
            restrict: 'A',
            scope: {
                model: '=molokoImageApi'
            },
            link: function (scope, element, attributes, ctrl) {
                //var e1 = element.val();
                let watch = scope.$watch('model', function () {
                    if (attributes.url && scope.model) {
                        element.attr("src", settings.webApiBaseUrl + attributes.url.replace(':id', scope.model));
                    }
                });
                // attributes.$observe('default', function(actual_value) {
                //     scope.def = actual_value;
                // });
                element.bind('error', function (error) {
                    //var attr = scope.def;
                    if (attributes.default && scope.model) {
                        if (!attributes.default)
                            element.attr('src', 'data:image/jpeg;base64,' + $rootScope.customer.Logo);
                        else
                            element.attr('src', attributes.default);
                        element.unbind('error');
                    }
                });
                element.bind('load', function (result) {
                    watch();
                    element.bind();
                });
            }
        };
    }]);
})();