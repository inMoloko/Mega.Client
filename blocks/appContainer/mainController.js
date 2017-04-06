(function () {
    "use strict";
    var controller = function ($scope, $http, settings, $state, $rootScope, arrayHelper, $q, Idle, $location, $stateParams, $timeout) {
        //Обработка простоя
        $scope.$on('IdleTimeout', function () {
            $state.go('navigation', {});
            Idle.watch();
        });

        $scope.formatThemesMain = [];
        $rootScope.orientation;

        //$scope.changeOrientation();
        //граф для поиска организаций
        $rootScope.mapGraph = new Graph();

        $scope.change = function () {
            $state.go('navigation.mainMenu', {});
        };
        // var floorPromise = $http.get(settings.webApiBaseUrl + '/floor?$select=FloorID,Number,File,Paths');
        var floorPromise;
        if (!settings.terminalID)
            floorPromise = $http.get(settings.webApiBaseUrl + '/floor/GetWithSize?CustomerID=' + settings.customerID || '');
        else
            floorPromise = $http.get(settings.webApiBaseUrl + '/floor/GetWithSize?CustomerID=' + settings.customerID + '&TerminalID=' + settings.terminalID);
        floorPromise.then(function (response) {
            //$rootScope.floors = response.data;
        });
        var organizationPromise = $http.get(settings.webApiBaseUrl + '/organization?$select=KeyWords,LogoBaseColor,Description,OrganizationID,Name,IsAnchor,Schedule,MapSize,CategoryOrganization/CategoryID,CategoryOrganization/Category/Name,CategoryOrganization/Category/IsUsed,CategoryOrganization/Category/ServiceCategoryType,OrganizationMapObject&$expand=CategoryOrganization/Category,OrganizationMapObject/MapObject&$orderby=Name asc&CustomerID=' + settings.customerID);
        organizationPromise.then(function (response) {
            //$rootScope.organizations = response.data;
        });
        var terminalPromise = $http.get(settings.webApiBaseUrl + '/Terminal?$expand=TerminalMapObject/MapObject&$select=LookDirectionAngleDegrees,Name,MTerminalID,OrganizationID,TerminalMapObject/MapObject&CustomerID=' + settings.customerID);
        terminalPromise.then(function (response) {
            //$rootScope.currentTerminal = response.data[0];
        });
        //var organizationLink = $http.get(settings.webApiBaseUrl + '/OrganizationLink?$expand=OrganizationFrom,OrganizationTo&$select=OrganizationToID,OrganizationFromID,OrganizationTo/Longitude,OrganizationTo/Latitude,OrganizationFrom/Longitude,OrganizationFrom/Latitude,OrganizationFrom/FloorID,OrganizationTo/FloorID&CustomerID=' + settings.customerID);
        var organizationLink = $http.get(settings.webApiBaseUrl + '/MapObjectLink?$expand=MapObjectFrom,MapObjectTo&CustomerID=' + settings.customerID);
        // var categoriesPromise =$http.get(settings.webApiBaseUrl + '/Category?$expand=Children&$select=Name,CategoryID&$filter=IsUsed eq true and ParentID eq null');
        var categoriesPromise = $http.get(settings.webApiBaseUrl + '/Category/GetAllRecursive?CustomerID=' + settings.customerID);

        var bannersPromise = $q.when({}); //$http.get(settings.webApiBaseUrl + '/Banner/GetAllActual?CustomerID=' + settings.customerID);

        var feedbackCategories = $q.when({});// $http.get(settings.webApiBaseUrl + '/FeedbackCategory?$select=Name,FeedbackCategoryID,ParentID&CustomerID=' + settings.customerID);

        let dt = new Date().toISOString();
        var filter = `(DateEnd ge DateTime'${dt}' or DateEnd eq null) and (DateBegin le DateTime'${dt}' or DateBegin eq null)`;

        var eventsPromise = $q.when({});//$http.get(settings.webApiBaseUrl + `/Event?$filter=${filter}&CustomerID=` + settings.customerID);

        var settingsPromise = $http.get(`${settings.webApiBaseUrl}/SystemSetting/Settings?CustomerID=${settings.customerID}`);

        var customerPromise = $http.get(`${settings.webApiBaseUrl}/Customer?CustomerID=${settings.customerID}`);


        //var proposalPromise = $http.get(settings.webApiBaseUrl + `/Proposal?$select=ProposalID,DateBegin,DateEnd,Name,Summary&$filter=${filter}&CustomerID=${settings.customerID}`);

        //var cinemaTimetable = $http.get(settings.webApiBaseUrl + `/Movie?$expand=CinemaTimeTables&CustomerID=${settings.customerID}`);

        $q.all([floorPromise, organizationPromise, terminalPromise, organizationLink, categoriesPromise, bannersPromise, feedbackCategories, eventsPromise, settingsPromise, customerPromise]).then(function (response) {

            $rootScope.floors = response[0].data;
            $rootScope.organizations = response[1].data;


            let terminal = settings.terminalID ? response[2].data.find(t => t.MTerminalID == settings.terminalID) : response[2].data[0];

            let radians = -Math.PI * terminal.LookDirectionAngleDegrees / 180;
            let cos = Math.cos(radians);
            let sin = Math.sin(radians);

            $rootScope.currentTerminal = terminal;
            $rootScope.currentTerminal.OrganizationTerminal = $rootScope.organizations.find(i => i.OrganizationID === $rootScope.currentTerminal.OrganizationID);
            $rootScope.currentTerminal.LookDirectionAngleDegrees = 0;

            $rootScope.currentTerminal.TerminalMapObject.forEach(function (mapObject) {
                let x = mapObject.MapObject.Longitude;
                let y = mapObject.MapObject.Latitude;
                mapObject.MapObject.Longitude = cos * x + sin * y;
                mapObject.MapObject.Latitude = cos * y - sin * x;
                if (mapObject.MapObject.Params)
                    mapObject.MapObject.ParamsAsJson = angular.isObject(mapObject.MapObject.Params) ? mapObject.MapObject.Params : angular.fromJson(mapObject.MapObject.Params);
            });

            $rootScope.organizations = $rootScope.organizations.filter(function (item) {
                return item.CategoryOrganization.find(j => j.CategoryID == 1570) === undefined; //|| item.OrganizationID === $rootScope.currentTerminal.OrganizationID;
            });

            $rootScope.organizationLinks = response[3].data;

            $rootScope.categories = response[4].data;

            $rootScope.banners = response[5].data;

            $rootScope.horizontalBanners = [];
            $rootScope.verticalBanners = [];

            // $rootScope.banners.forEach(i => {
            //     var img = new Image();
            //     img.src = 'data:image/jpeg;base64,' + i.Image;
            //     if (img.width > img.height)
            //         $rootScope.horizontalBanners.push(i);
            //     else
            //         $rootScope.verticalBanners.push(i);
            // });

            let megacard;
            $rootScope.categories.forEach(i => {
                i.Children.splice(i.Children.indexOf(i.Children.find(i => i.CategoryID == 1570)), 1);
                if (i.Name == 'Партнер MEGACARD') {
                    megacard = i.CategoryID;
                }
            });


            $rootScope.organizations.forEach(i => {
                i.megacard = i.CategoryOrganization.find(j => j.CategoryID == megacard) !== undefined;
                i.CategoryOrganization = i.CategoryOrganization.filter(j => j.Category.IsUsed == true);
                //TODO
                // let x = i.Longitude;
                // let y = i.Latitude;
                // i.Longitude = cos * x + sin * y;
                // i.Latitude = cos * y - sin * x;
                // if (i.SignPointLongitude && i.SignPointLatitude) {
                //     let x = i.SignPointLongitude;
                //     let y = i.SignPointLatitude;
                //
                //     i.SignPointLongitude = cos * x + sin * y;
                //     i.SignPointLatitude = cos * y - sin * x;
                // }
                i.OrganizationMapObject.forEach(function (mapObject) {
                    let x = mapObject.MapObject.Longitude;
                    let y = mapObject.MapObject.Latitude;
                    mapObject.MapObject.Longitude = cos * x + sin * y;
                    mapObject.MapObject.Latitude = cos * y - sin * x;
                    if (mapObject.MapObject.Params)
                        mapObject.MapObject.ParamsAsJson = angular.isObject(mapObject.MapObject.Params) ? mapObject.MapObject.Params : angular.fromJson(mapObject.MapObject.Params);
                });
            });

            $rootScope.feedbackCategories = response[6].data;

            $rootScope.events = response[7].data;
            // response[6].data.forEach(i=>{
            //     $rootScope.feedbackCategoriesDic[i.FeedbackCategoryID] = i;
            // });

            $rootScope.categories.unshift($rootScope.currentCategory = {
                Name: 'Все категории',
                CategoryID: -1,
                ParentID: null
            });
            $rootScope.categoriesDic = {};
            $rootScope.categories.forEach(i => {
                $rootScope.categoriesDic[i.CategoryID] = i;
            });

            //Выставляем типы сервистных категорий
            $rootScope.organizations.forEach(i => {
                for (let j = 0; j < i.CategoryOrganization.length; j++) {
                    let category = $rootScope.categoriesDic[i.CategoryOrganization[j].CategoryID];
                    if (category.ServiceCategoryType) {
                        i.ServiceCategoryType = category.ServiceCategoryType;
                        break;
                    }
                }
            });

            let graphLayerd = {};
            $rootScope.floorsDic = {};
            //Инициализируем граф путями этажей
            $rootScope.floors.forEach(function (floor, i, arr) {
                let layer = graphLayerd[floor.FloorID] = $rootScope.mapGraph.addLayer(floor.FloorID);
                let path = angular.fromJson(floor.Paths);
                path.forEach(p => {
                    let x1 = cos * p[0].x + sin * p[0].y;
                    let y1 = cos * p[0].y - sin * p[0].x;
                    let x2 = cos * p[1].x + sin * p[1].y;
                    let y2 = cos * p[1].y - sin * p[1].x;
                    //layer.addSegment(p[0].x, p[0].y, p[1].x, p[1].y);
                    layer.addSegment(x1, y1, x2, y2);
                });
                $rootScope.floorsDic[floor.FloorID] = floor;
            });

            //Добаляем линки (переходы)
            $rootScope.organizationLinks.forEach(i => {

                var layer1 = graphLayerd[i.MapObjectFrom.FloorID];
                var x = i.MapObjectFrom.Longitude;
                var y = i.MapObjectFrom.Latitude;
                var x1 = cos * x + sin * y;
                var y1 = cos * y - sin * x;
                var vertex1 = layer1.getVertex(x1, y1) || layer1.addVertexWithShortestSegment(x1, y1).vertex;

                var layer2 = graphLayerd[i.MapObjectTo.FloorID];
                x = i.MapObjectTo.Longitude;
                y = i.MapObjectTo.Latitude;
                var x2 = cos * x + sin * y;
                var y2 = cos * y - sin * x;
                var vertex2 = layer2.getVertex(x2, y2) || layer2.addVertexWithShortestSegment(x2, y2).vertex;
                if (vertex1 && vertex2) {
                    var segment1 = layer1.addSegment1(vertex1, vertex2);
                    layer2.addSegment1(vertex1, vertex2);
                }
            });
            let tm = $rootScope.currentTerminal.TerminalMapObject[0].MapObject;

            graphLayerd[tm.FloorID].addVertexWithShortestSegment(tm.Longitude, tm.Latitude);
            $rootScope.$broadcast('floorLoad');

            //поиск пути
            //var vertexList = $rootScope.mapGraph.findPath($rootScope.currentTerminal.Organization.Longitude, $rootScope.currentTerminal.Organization.Latitude, $rootScope.currentTerminal.Organization.Floor.FloorID, 150, 300, 2);

            $rootScope.statisticStack = [];

            $rootScope.currentStateName;
            $rootScope.currentStateParam;
            $rootScope.closeResultTitle;


            $rootScope.systemSettings = response[8].data;
            if ($rootScope.systemSettings && $rootScope.systemSettings.length) {
                let result = $rootScope.systemSettings.find(i => i.SettingType == "TERMINAL_MENU_ITEMS");
                if (result && result.Histories[0]) {
                    let value = angular.fromJson(result.Histories[0].SettingValue);
                    $rootScope.menuItems = {};
                    //Структура меню {"Название категории": id}
                    //или {"Название организации": {OrganizationID:id}}
                    let idx = 1;
                    angular.forEach(value, function (i, j) {
                        if (angular.isObject(i))
                            $rootScope.menuItems[idx] = {
                                Name: j,
                                OrganizationID: i.OrganizationID,
                                type: 'organization'
                            };
                        else
                            $rootScope.menuItems[idx] = {Name: j, CategoryID: i, type: 'category'};
                        idx++;
                    });

                }
                result = $rootScope.systemSettings.find(i => i.SettingType == "TERMINAL_SERVICE_CATEGORIES");
                if (result && result.Histories[0]) {
                    $rootScope.serviceCategories = angular.fromJson(result.Histories[0].SettingValue);
                }
                result = $rootScope.systemSettings.find(i => i.SettingType == "TERMINAL_CINEMA_ID");
                if (result && result.Histories[0]) {
                    $rootScope.cinemaID = angular.fromJson(result.Histories[0].SettingValue);
                }
                $rootScope.$broadcast('menuLoaded');
            }
            $rootScope.customer = response[9].data[0];
            let dat = new Date().getDay() - 1;
            if (dat < 0)
                dat = 6;
            $rootScope.customer.ScheduleFrom = JSON.parse($rootScope.customer.Schedule)[dat].From;
            $rootScope.customer.ScheduleTo = JSON.parse($rootScope.customer.Schedule)[dat].To;
            //$rootScope.menuItems = { "1965": { Name: 'Магазины', CategoryID: 1965 }, "1966": { Name: 'Рестораны и кафе', CategoryID: 1966 }, "1967": { Name: "Развлечения и услуги", CategoryID: 1967 } };

            //$rootScope.proposals = response[10].data;
            $rootScope.$broadcast('proposalsLoaded');
            //$rootScope.cinemaTimetable = response[11].data;
        });

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                //console.log(fromState, toState);
                //Начальное состояние ничего не выбранно
                if (toState.name === 'navigation.mainMenu') {
                    $rootScope.currentOrganizations = undefined;
                    $rootScope.currentOrganization = undefined;
                }
                ;
            });
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
            console.log('');
        });

        $rootScope.scrollConfig = {
            autoHideScrollbar: false,
            theme: 'minimal-dark',
            axis: 'y',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: false,
            scrollInertia: 0
        }
        $rootScope.$watch('formatTheme', function (n, o) {
            console.log('Change theme', n, o);
        });

        var x, y;

        //время работы якорей
        $rootScope.anchorOrganizations;

        $scope.showAnchorOrganization = function (item) {
            $state.go('navigation.organization', {
                OrganizationID: item.OrganizationID,
                Filter: $stateParams.Filter,
                CategoryID: $stateParams.CategoryID
            }, {inherit: true});
        };

        $scope.getDisplaySchedule = function (schedule) {
            var days = "";
            switch (schedule.listDays.length) {
                case 1:
                    return {type: schedule.listDays[0].day, schedule: $scope.getDisplayWorkTime(schedule)};
                case 2:
                    return {
                        type: schedule.listDays[0].day + " и " + schedule.listDays[1].day,
                        schedule: $scope.getDisplayWorkTime(schedule)
                    };
                case 3: {
                    if (Math.abs(schedule.listDays[0].num - schedule.listDays[1].num) == 1 && Math.abs(schedule.listDays[1].num - schedule.listDays[2].num) == 1)
                        return {
                            type: schedule.listDays[0].day + "-" + schedule.listDays[2].day,
                            schedule: $scope.getDisplayWorkTime(schedule)
                        };
                    else
                        return {
                            type: schedule.listDays[0].day + ", " + schedule.listDays[1].day + ", " + schedule.listDays[2].day,
                            schedule: $scope.getDisplayWorkTime(schedule)
                        };
                }
                default:
                    return {
                        type: 'Основное', schedule: $scope.getDisplayWorkTime(schedule)
                    };
            }
        };

        $scope.getDisplayWorkTime = function (schedule) {
            if (schedule.fromTime.trim() == schedule.toTime.trim())
                return "круглосуточно";
            else
                return schedule.fromTime.substring(0, 5) + "-" + schedule.toTime.substring(0, 5);
        };

        $rootScope.$watch('organizations', function () {
            if ($rootScope.organizations) {
                $rootScope.anchorOrganizations = $rootScope.organizations.filter(o => o.IsAnchor == 1 && o.Schedule != null);
                $rootScope.anchorOrganizations.forEach(i => {
                    try {
                        var schedule = JSON.parse(i.Schedule);

                        var listPeriod = [];
                        schedule.forEach(s => {
                            if (s.isUse != true) {
                                var period = {};
                                period.fromTime = s.From;
                                period.toTime = s.To;
                                period.listDays = [];
                                schedule.forEach(ss => {
                                    if (ss.From == s.From && ss.To == s.To) {
                                        period.listDays.push({num: schedule.indexOf(ss), day: ss.Name});
                                        ss.isUse = true;
                                    }
                                });
                                listPeriod.push(period);
                            }
                        });

                        listPeriod.sort(function (a, b) {
                            return b.listDays.length > 3;
                        });
                        i.displaySchedule = [];
                        listPeriod.forEach(lp => {
                            i.displaySchedule.push($scope.getDisplaySchedule(lp));
                        });
                    }
                    catch (exc) {
                        return;
                    }
                });
                $rootScope.anchorOrganizations = $rootScope.anchorOrganizations.filter(a => a.displaySchedule != undefined);
            }
        });

        $rootScope.filters = {};
    };
    controller.$inject = ['$scope', '$http', 'settings', '$state', '$rootScope', 'arrayHelper', '$q', 'Idle', '$location', '$stateParams', '$timeout'];
    angular.module('app').controller('mainController', controller);
})();