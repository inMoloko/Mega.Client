(function () {
    "use strict";
    var app = angular.module('app');
    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/navigation');

        // States
        $stateProvider
            .state('navigation', {
                params: {
                    shopFilter: null,
                    restaurantFilter: null,
                    entertainmentFilter: null,
                },
                url: "/navigation",
                // templateUrl: 'navigation.html',
                views: {
                    'search': {
                        templateUrl: 'blocks/searchControlMainPage/searchControlMainPage.html',
                        controller: 'searchControlMainPageController',
                        controllerAs: 'controller'
                    },
                    'searchResult': {
                        templateUrl: 'blocks/sideMenu/sideMenu.html',
                    },
                    'navigation': {
                        templateUrl: 'blocks/navigation/navigation.html',
                    }
                },
                // templateUrl:'blocks/appContainer/appContainer.html',
                resetMap: true
            })
            .state('navigation.mainMenu.organization', {
                url: '/organization/:OrganizationID?MapObjectID',
                views: {
                    'search': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html'
                    },
                    'searchResult': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.shops', {
                url: '/shops?CategoryID',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html',
                        controller: 'shopHeadingController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController'
                    }
                }
            })
            .state('navigation.shops.filter', {
                url: '/filter',
                params: {
                    Organizations: {array: true},
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/filterHeading/filterHeading.html',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/filter/filter.html',
                        controller: 'filterController',
                        controllerAs: 'controller'
                    },
                    'navigation@': {
                        templateUrl: 'blocks/filterFooter/filterFooter.html',
                        controller: 'filterFooterController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.shops.filter.filterList', {
                url: '/filterList',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html',
                        controller: 'shopHeadingController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'filterListController',
                        controllerAs: 'controller'
                    },
                    'navigation@': {
                        templateUrl: 'blocks/navigation/navigation.html',
                    }
                }
            })
            .state('navigation.shops.filter.filterList.organization', {
                url: '/organization/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html',
                        controller: 'shopHeadingController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.shops.searchResult', {
                url: '/searchResult?Filter',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController',
                        controllerAs: 'controller'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.shops.searchResult.organization', {
                url: '/organization/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html',
                        controller: 'shopHeadingController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.shops.organization', {
                url: '/organization/:OrganizationID',
                views: {
                    'search': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html',
                        controller: 'shopHeadingController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.shops.organization.proposals', {
                url: '/proposals/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/proposalsHeading/proposalsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/proposalListControl/proposalListControl.html',
                        controller: 'proposalListController',
                        controllerAs: 'controller'
                    }
                }
            })
            //=====================Proposal=====================
            .state('navigation.proposals', {
                url: '/proposals/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/proposalsHeading/proposalsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/proposalListControl/proposalListControl.html',
                        controller: 'proposalListController',
                        controllerAs: 'controller'
                    }

                }
            })
            .state('navigation.proposals.proposal', {
                url: '/proposal/:ProposalID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/proposalsHeading/proposalsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/proposal/proposal.html',
                        controller: 'proposalController',
                        controllerAs: 'controller'
                    }

                }
            })
            .state('navigation.proposals.searchResult', {
                url: '/searchResult?Filter',
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/proposalListControl/proposalListControl.html',
                        controller: 'proposalListController',
                        controllerAs: 'controller'
                    }

                }
            })
            .state('navigation.proposals.searchResult.proposal', {
                url: '/proposal/:ProposalID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/proposalsHeading/proposalsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/proposal/proposal.html',
                        controller: 'proposalController',
                        controllerAs: 'controller'
                    }

                }
            })
            //=====================Restaurants=====================
            .state('navigation.restaurant', {
                url: '/restaurant/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/restaurantHeading/restaurantHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/restaurant/restaurant.html',
                        controller: 'restaurantController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.restaurants', {
                url: '/restaurants?CategoryID',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/restaurantHeading/restaurantHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController',
                        controllerAs: 'controller'
                    }

                }
            })
            .state('navigation.restaurants.filter', {
                url: '/filter',
                params: {
                    Organizations: {array: true},
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/filterHeading/filterHeading.html',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/filter/filter.html',
                        controller: 'filterController',
                        controllerAs: 'controller'
                    },
                    'navigation@': {
                        templateUrl: 'blocks/filterFooter/filterFooter.html',
                        controller: 'filterFooterController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.restaurants.filter.filterList', {
                url: '/filterList',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/restaurantHeading/restaurantHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'filterListController',
                        controllerAs: 'controller'
                    },
                    'navigation@': {
                        templateUrl: 'blocks/navigation/navigation.html',
                    }
                }
            })
            .state('navigation.restaurants.filter.filterList.organization', {
                url: '/organization/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/restaurantHeading/restaurantHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/restaurant/restaurant.html',
                        controller: 'restaurantController',
                        controllerAs: 'controller'
                    }

                }
            })
            .state('navigation.restaurants.restaurant', {
                url: '/organization/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/restaurantHeading/restaurantHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/restaurant/restaurant.html',
                        controller: 'restaurantController',
                        controllerAs: 'controller'
                    }

                }
            })
            .state('navigation.restaurants.searchResult', {
                url: '/searchResult?Filter',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController',
                        controllerAs: 'controller'
                    }
                },
                reloadOnSearch: true
            })
            .state('navigation.restaurants.searchResult.organization', {
                url: '/organization/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/restaurantHeading/restaurantHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/restaurant/restaurant.html',
                        controller: 'restaurantController',
                        controllerAs: 'controller'
                    }

                }
            })
            //=====================Entertainments=====================
            .state('navigation.entertainment', {
                url: '/entertainment/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/entertainmentsHeading/entertainmentsHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.entertainments', {
                url: '/entertainments?CategoryID',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/entertainmentsHeading/entertainmentsHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController'
                    }
                }
            })
            .state('navigation.entertainments.filter', {
                url: '/filter',
                params: {
                    Organizations: {array: true},
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/filterHeading/filterHeading.html',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/filter/filter.html',
                        controller: 'filterController',
                        controllerAs: 'controller'
                    },
                    'navigation@': {
                        templateUrl: 'blocks/filterFooter/filterFooter.html',
                        controller: 'filterFooterController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.entertainments.filter.filterList', {
                url: '/filterList',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/entertainmentsHeading/entertainmentsHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'filterListController',
                        controllerAs: 'controller'
                    },
                    'navigation@': {
                        templateUrl: 'blocks/navigation/navigation.html',
                    }
                }
            })
            .state('navigation.entertainments.filter.filterList.organization', {
                url: '/organization/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/entertainmentsHeading/entertainmentsHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/entertainment/entertainment.html',
                        controller: 'entertainmentController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.entertainments.searchResult', {
                url: '/searchResult?Filter',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController',
                        controllerAs: 'controller'
                    }
                },
                reloadOnSearch: true
            })
            .state('navigation.entertainments.searchResult.entertainment', {
                url: '/entertainment/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/entertainmentsHeading/entertainmentsHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/entertainment/entertainment.html',
                        controller: 'entertainmentController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.entertainments.entertainment', {
                url: '/entertainment/:OrganizationID',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/entertainmentsHeading/entertainmentsHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/entertainment/entertainment.html',
                        controller: 'entertainmentController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.favoriteSearch', {
                url: '/favoriteSearch',
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/favoriteSearch/favoriteSearch.html',
                        controller: 'favoriteSearchController',
                        controllerAs: 'controller'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.favoriteSearch.searchResult', {
                url: '/searchResult?Filter',
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organizationsList/organizationsList.html',
                        controller: 'organizationsListController'
                    }
                },
                reloadOnSearch: false
            })
            .state('navigation.favoriteSearch.searchResult.organization', {
                url: '/organization/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html',
                        controller: 'shopHeadingController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.favoriteSearch.searchResult.restaurant', {
                url: '/restaurant/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/restaurantHeading/restaurantHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/restaurant/restaurant.html',
                        controller: 'restaurantController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.favoriteSearch.searchResult.entertainment', {
                url: '/entertainment/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/entertainmentsHeading/entertainmentsHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/entertainment/entertainment.html',
                        controller: 'entertainmentController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.favoriteSearch.searchResult.service', {
                url: '/service/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/servicesHeading/servicesHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/service/service.html',
                        controller: 'serviceController',
                        controllerAs: 'controller'
                    }
                }
            })
            /* Сюда переходим когда выбранна оргия на карте*/
            .state('navigation.organization', {
                url: '/organization/:OrganizationID?MapObjectID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/shopHeading/shopHeading.html',
                        controller: 'shopHeadingController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/organization/organization.html',
                        controller: 'organizationController',
                        controllerAs: 'controller'
                    }
                },
                // reloadOnSearch: false
            })
            .state('navigation.organization.proposals', {
                url: '/proposals/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/proposalsHeading/proposalsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/proposalListControl/proposalListControl.html',
                        controller: 'proposalListController',
                        controllerAs: 'controller'
                    }
                }
            })
            //=====================Services=================
            .state('navigation.service', {
                url: '/service/:OrganizationID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/servicesHeading/servicesHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/service/service.html',
                        controller: 'organizationController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.services', {
                url: '/services/:CategoryID',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/servicesHeading/servicesHeading.html',
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/servicesList/servicesList.html',
                        controller: 'servicesListController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.services.organization', {
                url: '/organization/:OrganizationID',
                params: {},
                views: {}
            })
            .state('navigation.services.searchResult', {
                url: '/searchResult?Filter',
                params: {
                    Organizations: {array: true}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/servicesList/servicesList.html',
                        controller: 'servicesListController',
                        controllerAs: 'controller'
                    }
                },
                reloadOnSearch: true
            })
            .state('navigation.services.searchResult.organization', {
                url: '/organization/:OrganizationID',
                params: {},
                views: {}
            })
            //=====================more=====================
            .state('navigation.more', {
                url: '/more',
                views: {
                    'search@': {
                        templateUrl: 'blocks/moreHeading/moreHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/more/more.html'
                    }
                },
            })
            //=====================schedule===================
            .state('navigation.more.schedule', {
                url: '/schedule',
                views: {
                    'search@': {
                        templateUrl: 'blocks/scheduleHeading/scheduleHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/schedule/schedule.html'
                    }
                },
            })
            //=====================feedback===================
            .state('navigation.more.feedback', {
                url: '/feedback',
                views: {
                    'search@': {
                        templateUrl: 'blocks/feedbackHeading/feedbackHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/feedback/feedback.html',
                        controller: 'feedbackController',
                        controllerAs: 'controller'
                    }
                },
            })
            .state('navigation.more.feedback.final', {
                url: '/final',
                params: {
                    feedback: {}
                },
                views: {
                    'search@': {
                        templateUrl: 'blocks/feedbackFinalHeading/feedbackFinalHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/feedbackFinal/feedbackFinal.html',
                        controller: 'feedbackFinalController',
                        controllerAs: 'controller'
                    }
                },
            })
            //=====================events=====================
            .state('navigation.more.events', {
                url: '/events',
                views: {
                    'search@': {
                        templateUrl: 'blocks/eventsHeading/eventsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/eventsList/eventsList.html',
                        controller: 'eventsListController',
                        controllerAs: 'controller'
                    }
                },
            })
            .state('navigation.more.events.event', {
                url: '/event/:EventID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/eventsHeading/eventsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/event/event.html',
                        controller: 'eventController',
                        controllerAs: 'controller'
                    }
                }
            })
            .state('navigation.more.events.searchResult', {
                url: '/searchResult?Filter',
                views: {
                    'search@': {
                        templateUrl: 'blocks/searchControlFilter/searchControlFilter.html',
                        controller: 'searchControlFilterController',
                        controllerAs: 'controller'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/eventsList/eventsList.html',
                        controller: 'eventsListController',
                        controllerAs: 'controller'
                    }
                },
            })
            .state('navigation.more.events.searchResult.event', {
                url: '/event/:EventID',
                views: {
                    'search@': {
                        templateUrl: 'blocks/eventsHeading/eventsHeading.html'
                    },
                    'searchResult@': {
                        templateUrl: 'blocks/event/event.html',
                        controller: 'eventController',
                        controllerAs: 'controller'
                    }
                },
            });
    }]);
})();
