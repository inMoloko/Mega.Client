(function () {
    "use strict";
    // L.Marker.prototype.__setPos = L.Marker.prototype._setPos;
    // L.Marker.prototype._setPos = function () {
    //     L.Marker.prototype.__setPos.apply(this, arguments);
    //     this._zIndex = this.options.zIndexOffset;
    //     this._resetZIndex();
    // };
    const constants = {
        Terminal: 0,
        Link: 1,
        Service: 2
    };

    angular.module('app').directive("molokoMap", [
        '$rootScope', '$http', '$q', 'settings', '$linq', '$state', '$stateParams', '$timeout', 'mainMenuService', 'categoryService', function ($rootScope, $http, $q, settings, $linq, $state, $stateParams, $timeout, mainMenuService, categoryService) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    options: '=options'
                },
                templateUrl: 'blocks/mapControl/molokoMap.html',
                link: function ($scope, element, attrs) {

                    let scale = 4;

                    $scope.rootScope = $rootScope;
                    if (!$scope.options)
                        $scope.options = {};
                    if (!$scope.options.minZoom)
                        $scope.options.minZoom = 1;
                    if (!$scope.options.maxZoom)
                        $scope.options.maxZoom = 6;
                    if (!$scope.options.orginalAngel)
                        $scope.options.orginalAngel = false;
                    var elm = element[0].children[0];

                    // Инициализируем карту Leaflet
                    var map = L.map(elm, {
                        rotate: true,
                        minZoom: $scope.options.minZoom,
                        maxZoom: $scope.options.maxZoom,
                        zoomControl: false,
                        attributionControl: false,
                        markerZoomAnimation: false,
                        crs: L.CRS.Simple,
                        inertia: false,
                        bounceAtZoomLimits: true,
                        fadeAnimation: false,
                    });
                    $q.all([mainMenuService.get(), categoryService.getAllRecursive()]).then(function (result) {
                        $scope.menuItems = result[0];
                        $scope.menuItems.init(result[1]);
                    });
                    // mainMenuService.get().then(function (result) {
                    //     $scope.menuItems = result;
                    // });
                    //console.log('Create map');
                    map.setView([0, 0], 1);
                    //Сброс карты
                    $scope.options.reset = function (data) {
                        $scope.options.orginalAngel = false;
                        delete $scope.selectedOrganizations;
                        $scope.setFloor($rootScope.currentTerminal.TerminalMapObject[0].MapObject.FloorID);
                        setBounds(data);
                        //setView(data);
                    };

                    function getZoomRange(widthMap, heightMap, widthArea, heightArea) {
                        let a = $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        let currentWidth = (a == 0 || a == 180) ? widthMap : heightMap;
                        let currentHeight = (a == 0 || a == 180) ? heightMap : widthMap;
                        let count = 0;
                        while (currentHeight > heightArea && currentWidth > widthArea) {
                            currentHeight = currentHeight / 2;
                            currentWidth = currentWidth / 2;
                            count++;
                        }
                        ;
                        return count;
                    }

                    function setBounds() {
                        map.invalidateSize();
                        let bounds = $scope.currentMapFloor.layerGroup.getBounds(); // layer.getBounds();
                        let rad = $rootScope.currentTerminal ? $rootScope.currentTerminal.LookDirectionAngleDegrees : 0;
                        rad = $scope.options.orginalAngel == true ? 0 : rad;

                        let size = map.getSize();
                        let width = $state.current.name == "navigation" ? 50 : size.x * 0.3;
                        width = 50;
                        //calculateBounds();
                        map.fitBounds(bounds, {
                            //paddingTopLeft: [50, 50],
                            //paddingBottomRight: [50, 50],
                            reset: true,
                            animate: false
                        });
                        let zoom = map.getBoundsZoom(bounds);
                        //map.fitBounds(bounds, { reset: false, animate: false });
                        //calculateBounds();
                    };

                    var formatThemeHandler = $rootScope.$watch("formatTheme", function (n, w) {
                        if (n == w)
                            return;
                        //Обязательно нужно пересуитать размеры
                        map.invalidateSize();
                        $timeout(function () {
                            setBounds();
                        }, 10);
                        $timeout(function () {
                            setBounds();
                        }, 40);
                        // /setBounds();
                    });
                    // Задаем обработчики событий
                    map.on("click", function (e) {
                        var floorID = $scope.currentMapFloor.FloorID;
                        var currentPoint = map.project(e.latlng);

                        // var filtered = $linq.Enumerable().From($scope.mapOrganizations).Select(i => {
                        //     return {
                        //         Organization: i.Value,
                        //         Distance: currentPoint.distanceTo(map.project(i.Value.marker._latlng))
                        //     };
                        // }).Where(i => i.Distance <= 50 && i.Organization.FloorID === floorID).OrderBy(i => i.Distance).ToArray();

                        var filtered = $linq.Enumerable().From($scope.mapFloors[floorID].floorMapObjects).Select(i => {
                            return {
                                OrganizationID: i.Key,
                                MapObject: $linq.Enumerable().From(i.Value).Select(j => {
                                    return {
                                        Distance: currentPoint.distanceTo(map.project(j.position)),
                                        MapObjectID: j.mapObjectID
                                    };
                                }).OrderBy(j => j.Distance).FirstOrDefault()
                            };
                        }).Where(i => i.MapObject.Distance <= 50).OrderBy(i => i.MapObject.Distance).ToArray();

                        if (filtered[0] !== undefined) {
                            if ($rootScope.currentOrganization && $rootScope.currentOrganization.OrganizationID === filtered[0].OrganizationID || filtered[0].OrganizationID === $rootScope.currentTerminal.OrganizationID) {
                                return;
                            }
                            clickToOrganization(filtered[0].OrganizationID, filtered[0].MapObject.MapObjectID);
                        }
                    });
                    // var _orginalAngel = $scope.$watch('options.orginalAngel', function (n, o) {
                    //     if (n === o)
                    //         return;
                    //     if ($scope.options.orginalAngel)
                    //         map.setBearing(0);
                    //     else
                    //         map.setBearing($rootScope.currentTerminal.LookDirectionAngleDegrees);
                    //     //setView({ fullScreen: $state.current.name == "navigation" });
                    //     setBounds();
                    // });
                    var tmprect;

                    function calculateBounds(offset) {
                        offset = 50;
                        let full = $state.current.name == "navigation";

                        var tb = $scope.currentMapFloor.layer.getBounds();

                        var s1 = map.containerPointToLatLng(L.point(0, 0));
                        var s2 = map.containerPointToLatLng(L.point(offset || 620, 0));
                        var s = s2.lng - s1.lng;

                        s2 = map.containerPointToLatLng(L.point(50, 0));
                        let p = s2.lng - s1.lng;
                        var maxBoundsSouthWest = new L.LatLng(tb.getSouthWest().lat, full ? tb.getSouthWest().lng : tb.getSouthWest().lng - s);
                        var maxBoundsNorthEast = new L.LatLng(tb.getNorthEast().lat, tb.getNorthEast().lng);

                        let bounds = new L.LatLngBounds(maxBoundsSouthWest, maxBoundsNorthEast);
                        map.setMaxBounds(bounds);

                        return bounds.getCenter();
                    }


                    // Задаем блокирование масштабирования
                    map.on("zoomend", function () {
                        $scope.options.zoom = this.getZoom();
                        $scope.minusDisable = $scope.options.zoom <= map.getMinZoom();
                        $scope.plusDisable = $scope.options.zoom >= map.getMaxZoom();


                        //calculateBounds();
                        if (!$rootScope.$$phase)
                            $scope.$parent.$digest();
                    });

                    function clickToOrganization(orgID, mapObjectID) {

                        let organization = $rootScope.organizations.find(i => i.OrganizationID == orgID);

                        if (organization.CategoryOrganization.length > 1 || organization.CategoryOrganization.length == 0) {
                            $state.go("navigation.shop", {
                                OrganizationID: orgID,
                                MapObjectID: mapObjectID
                            });
                        }
                        else {
                            let categoryID = organization.CategoryOrganization[0].CategoryID;
                            var value = $scope.menuItems['Рестораны и кафе'];
                            let cats = $rootScope.categories.find(i => i.CategoryID == value).ChildrenIds;
                            if (cats.includes(categoryID)) {
                                $state.go("navigation.restaurant", {
                                    OrganizationID: orgID,
                                    MapObjectID: mapObjectID
                                });
                                return;
                            }
                            value = $scope.menuItems['Развлечения и услуги'];
                            cats = $rootScope.categories.find(i => i.CategoryID == value).ChildrenIds;
                            if (cats.includes(categoryID)) {
                                $state.go("navigation.entertainment", {
                                    OrganizationID: orgID,
                                    MapObjectID: mapObjectID
                                });
                                return;
                            }
                            value = $scope.menuItems['Сервисы'];
                            cats = $rootScope.categories.find(i => i.CategoryID == value).ChildrenIds;
                            if (cats.includes(categoryID)) {
                                $state.go("navigation.service", {
                                    OrganizationID: orgID,
                                    MapObjectID: mapObjectID
                                });
                                return;
                            }
                            $state.go("navigation.shop", {
                                OrganizationID: orgID,
                                MapObjectID: mapObjectID
                            });
                        }
                    };
                    //Изменение маршрута
                    let stateChangeHandler = $rootScope.$on('$stateChangeSuccess',
                        function (event, toState, toParams, fromState, fromParams) {

                            clearSelect();
                            if ($state.params.OrganizationID) {
                                let mapObjects;
                                if ($stateParams.MapObjectID) {
                                    document.querySelectorAll('[data-map-id="' + $stateParams.MapObjectID + '"]').forEach(m => {
                                        m.classList.add('_selected');
                                    });
                                    if (!$scope.mapObjects)
                                        return;
                                    mapObjects = [$scope.mapObjects[$stateParams.MapObjectID]];
                                }
                                else {
                                    document.querySelectorAll('[data-org-id="' + $state.params.OrganizationID + '"]').forEach(m => {
                                        m.classList.add('_selected');
                                    });
                                    if (!$rootScope.organizations)
                                        return;
                                    mapObjects = $rootScope.organizations.find(i => i.OrganizationID == $state.params.OrganizationID).OrganizationMapObject.map(i => i.MapObject);
                                }
                                // $scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID].marker.setIcon(markerIcon);

                                $scope.selectedOrganizations = [$rootScope.organizations.find(i => i.OrganizationID == $state.params.OrganizationID)];
                                //Отрисовка бегушего человека
                                //$rootScope.currentPath = $rootScope.mapGraph.findPath($rootScope.currentTerminal.OrganizationTerminal.Longitude, $rootScope.currentTerminal.OrganizationTerminal.Latitude, $rootScope.currentTerminal.Organization.Floor.FloorID, $rootScope.currentOrganization.Longitude, $rootScope.currentOrganization.Latitude, $rootScope.currentOrganization.FloorID);

                                let result = getOptimalPath(mapObjects);
                                //Может быть клик на надпись, но нет входа
                                if (!result) {
                                    delete $rootScope.currentPath;
                                }
                                else {
                                    $rootScope.currentPath = result.path;
                                    $scope.setFloor(result.object.FloorID);
                                }
                                return;

                            }
                            delete $rootScope.currentPath;
                            if ($state.params.Organizations) {
                                if ($scope.selectedOrganizations !== undefined) {
                                    $scope.selectedOrganizations = undefined;
                                }
                                if ($state.params.Organizations !== undefined) {
                                    $state.params.Organizations.forEach(org => {
                                        document.querySelectorAll('[data-org-id="' + org.OrganizationID + '"]').forEach(m => {
                                            m.classList.add('_selected');
                                        });
                                    });
                                    $scope.selectedOrganizations = $state.params.Organizations;
                                }
                                return;
                            }
                            if (!$state.params.OrganizationID && !$state.params.Organizations)
                                delete $scope.selectedOrganizations;
                        });

                    function getIcon(org, selected, mapObjectID) {
                        let cls = ($rootScope.currentOrganization !== undefined && org.OrganizationID === $rootScope.currentOrganization.OrganizationID) || selected ? ' _selected"' : '';
                        let html;
                        if ($rootScope.currentTerminal.OrganizationID === org.OrganizationID) {
                            html = `<div data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"><img style="width:40px;margin-top: -60px;margin-left: -10px;" src="Content/images/youHere.png"/></div>`;
                        } else {
                            //Тип организации дополнительно
                            //if (org.OrganizationType === 5) {
                            if (org.CategoryOrganization.map(i => i.Category.ServiceCategoryType).filter(i => i == constants.Service || i == constants.Link).length != 0) {
                                if (org.CategoryOrganization.length != 0) {
                                    let cat = org.CategoryOrganization[0];
                                    if (org.CategoryOrganization.map(i => i.CategoryID).includes($rootScope.serviceCategories.toilet))
                                        html = `<div><img class="marker__image marker__wc${cls}" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                    // else if (cat.CategoryID === $rootScope.serviceCategories.terminal)
                                    //     html = ``;
                                    else
                                        html = `<div><img class="marker__image${cls}" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                }
                            }
                            else //if (org.MapSize > 0 && org.SignPointRadius == null)
                            {
                                html = `<div><svg><circle class="marker__item${cls}" cx="5" cy="5" r="5" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></svg></div>`;
                                if (org.CategoryOrganization.length > 1 || org.CategoryOrganization.length === 0) {
                                    html = `<div><img class="marker__image${cls}" src="/Content/images/card_shop_logo_holder.png" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                } else {
                                    let categoryID = org.CategoryOrganization[0].CategoryID;
                                    // let restaurant = $scope.menuItems['Рестораны и кафе'] || -1;
                                    // let restaurantCats = $rootScope.categories.find(i => i.CategoryID == restaurant).ChildrenIds;
                                    // let entertainment = $scope.menuItems['Развлечения и услуги'] || -1;
                                    // let entertainmentCats = $rootScope.categories.find(i => i.CategoryID == entertainment).ChildrenIds;
                                    // let service = $scope.menuItems['Сервисы'] || -1;
                                    // let serviceCats = $rootScope.categories.find(i => i.CategoryID == service).ChildrenIds;

                                    let type = $scope.menuItems.getType(categoryID);

                                    if (type === 'restaurant') {
                                        html = `<div><img class="marker__image${cls}" src="/Content/images/card_food_logo_holder.png" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                    } else if (type === 'entertainment') {
                                        html = `<div><img class="marker__image${cls}" src="/Content/images/card_enterteinment_logo_holder.png" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                    } else if (type === 'service') {
                                        html = `<div><img class="marker__image${cls}" src="/Content/images/card_enterteinment_logo_holder.png" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;
                                    } else
                                        html = `<div><img class="marker__image${cls}" src="/Content/images/card_shop_logo_holder.png" data-org-id="${org.OrganizationID}" data-map-id="${mapObjectID}"/></div>`;

                                }
                            }
                        }
                        return L.divIcon({className: 'marker', html: html, iconSize: [16, 16]});
                    }

                    function getZIndex(item) {
                        //Вы
                        if ($rootScope.currentTerminal.OrganizationID === item.OrganizationID)
                            return 400;
                        //Сервистные
                        if (item.OrganizationType === 5)
                            return 1;
                        return 10;
                    };
                    let init = $rootScope.$watchCollection('organizations', function () {
                        if ($rootScope.organizations === undefined || $scope.mapOrganizations || $scope.mapFloors) {
                            return;
                        }
                        ;
                        $scope.mapFloors = {};
                        $scope.mapOrganizations = {};
                        $scope.mapObjects = {};
                        //var promises = [];
                        $rootScope.floors.forEach(item => {
                            let size = map.getSize();
                            let range = getZoomRange(item.Width, item.Height, size.x * 0.3, size.y);
                            //TODO Тут надо подумать пока будем брать максимальный зум
                            if (map.options.maxZoom < map.options.minZoom + range)
                                map.options.maxZoom = map.options.minZoom + range;

                            //var image = getImage(item.File);
                            //promises.push(image);
                            //image.then(function (value) {
                            var value = {width: item.Width, height: item.Height};
                            var southWest = map.unproject([-value.width * scale / 2, value.height * scale / 2], map.getMaxZoom());
                            var northEast = map.unproject([value.width * scale / 2, -value.height * scale / 2], map.getMaxZoom());


                            if (!settings.terminalID)
                                item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File`, new L.LatLngBounds(southWest, northEast)/*[southWest, northEast]*/);
                            else
                                item.layer = L.imageOverlay(`${settings.webApiBaseUrl}/Floor/${item.FloorID}/File?TerminalID=${settings.terminalID}`, [southWest, northEast]);
                            item.layerGroup = L.featureGroup();
                            item.pathGroup = L.layerGroup();
                            item.floorMapObjects = {};
                            $scope.mapFloors[item.FloorID] = item;

                            //let rect = L.rectangle(item.layer.getBounds());
                            //map.addLayer(rect);
                            map.setMaxBounds(item.layer.getBounds());

                        });
                        //$q.all(promises).then(function () {

                        //Чтобы поставить маркер для терминала без отображения терминалов
                        var terminalOrg = $rootScope.currentTerminal.TerminalMapObject[0].MapObject;
                        var position = map.unproject([terminalOrg.Longitude * scale, terminalOrg.Latitude * scale], map.getMaxZoom());
                        let markerIcon = getIcon($rootScope.currentTerminal, false);
                        terminalOrg.marker = L.marker(position, {
                            icon: markerIcon,
                            title: terminalOrg.Name,
                            iconSize: [16, 16],
                            zIndexOffset: getZIndex($rootScope.currentTerminal)
                        });
                        $scope.mapFloors[terminalOrg.FloorID].layerGroup.addLayer(terminalOrg.marker, {pane: 'tilePane'});
                        $scope.mapOrganizations[terminalOrg.OrganizationID] = terminalOrg;

                        //Наносим организации
                        $scope.options.zoom = map.getZoom();
                        $rootScope.organizations.forEach(item => {
                            item.OrganizationMapObject.forEach(mapObject => {
                                let position = map.unproject([mapObject.MapObject.Longitude * scale, mapObject.MapObject.Latitude * scale], map.getMaxZoom());
                                if (mapObject.MapObject.ParamsAsJson && mapObject.MapObject.ParamsAsJson.SignPointRadius) {
                                    mapObject.MapObject.Latitude = mapObject.MapObject.Latitude * scale;
                                    mapObject.MapObject.Longitude = mapObject.MapObject.Longitude * scale;
                                    mapObject.MapObject.ParamsAsJson.SignPointRadius = mapObject.MapObject.ParamsAsJson.SignPointRadius * scale;
                                    var markerText = L.Marker.zoomingMarker(mapObject.MapObject);
                                    markerText.on("click", function (e) {
                                        //$rootScope.currentOrganization = item;
                                        clickToOrganization(item.OrganizationID);
                                    });
                                    $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(markerText);
                                } else if ($rootScope.currentTerminal.OrganizationID === item.OrganizationID) {
                                    let marker = L.marker(position, {
                                        icon: L.divIcon({
                                            className: 'marker',
                                            html: `<div data-org-id="${item.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"><img style="width:40px;margin-top: -60px;margin-left: -10px;" src="Content/images/youHere.png"/></div>`,
                                            iconSize: [16, 16]
                                        }),
                                        title: item.Name,
                                        iconSize: [16, 16],
                                        zIndexOffset: 400
                                    });
                                    if (mapObject.MapObject.FloorID) {
                                        $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(marker);
                                        if (!$scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID])
                                            $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID] = [];

                                        $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID].push({
                                            position: position,
                                            mapObjectID: mapObject.MapObject.MapObjectID
                                        });
                                    }
                                } else if (item.CategoryOrganization.map(i => i.Category.ServiceCategoryType).filter(i => i === constants.Service || i === constants.Link).length !== 0) {
                                    let html;
                                    if (item.CategoryOrganization.length != 0) {
                                        let cat = item.CategoryOrganization[0];
                                        if (item.CategoryOrganization.map(i => i.CategoryID).includes($rootScope.serviceCategories.toilet))
                                            html = `<div><img class="marker__image marker__wc" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${item.OrganizationID}" data-map-id="${mapObject.MapObject}"/></div>`;
                                        else
                                            html = `<div><img class="marker__image" src="${settings.webApiBaseUrl}/Category/${cat.CategoryID}/Logo" data-org-id="${item.OrganizationID}" data-map-id="${mapObject.MapObject}"/></div>`;
                                    }
                                    let icon = L.divIcon({className: 'marker', html: html, iconSize: [16, 16]});
                                    let marker = L.marker(position, {
                                        icon: icon,
                                        title: item.Name,
                                        iconSize: [16, 16],
                                        zIndexOffset: 10
                                    });
                                    if (mapObject.MapObject.FloorID) {
                                        $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(marker);
                                        if (!$scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID])
                                            $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID] = [];

                                        $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID].push({
                                            position: position,
                                            mapObjectID: mapObject.MapObject.MapObjectID
                                        });
                                    }
                                }
                                else if (!item.CategoryOrganization || item.CategoryOrganization.length === 0) {

                                } else {
                                    //var position = map.unproject([mapObject.MapObject.Longitude, mapObject.MapObject.Latitude], map.getMaxZoom());
                                    // let markerIcon = getIcon(item, false, mapObject.MapObject.MapObjectID);
                                    // let marker = L.marker(position, {
                                    //     icon: markerIcon,
                                    //     title: item.Name,
                                    //     iconSize: [16, 16],
                                    //     zIndexOffset: getZIndex(item)
                                    // });
                                    let categoryID = item.CategoryOrganization[0].CategoryID;
                                    let type = $scope.menuItems.getType(categoryID);
                                    let img = {
                                        'service': '/Content/images/card_enterteinment_logo_holder.png',
                                        'entertainment': '/Content/images/card_enterteinment_logo_holder.png',
                                        'restaurant': '/Content/images/card_food_logo_holder.png',
                                        'shop': '/Content/images/card_shop_logo_holder.png'
                                    };
                                    mapObject.MapObject.Latitude = mapObject.MapObject.Latitude * scale;
                                    mapObject.MapObject.Longitude = mapObject.MapObject.Longitude * scale;

                                    let marker = L.Marker.iconShowMarker(mapObject.MapObject, item, {
                                        src: img[type],
                                        threshold: map.getMaxZoom() - 1,
                                        title: item.Name
                                    });
                                    if (mapObject.MapObject.FloorID) {
                                        $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(marker, {pane: 'tilePane'});
                                        if (!$scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID])
                                            $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID] = [];

                                        $scope.mapFloors[mapObject.MapObject.FloorID].floorMapObjects[item.OrganizationID].push({
                                            position: position,
                                            mapObjectID: mapObject.MapObject.MapObjectID
                                        });
                                    }
                                }
                                $scope.mapObjects[mapObject.MapObject.MapObjectID] = mapObject.MapObject;
                            });

                            $scope.mapOrganizations[item.OrganizationID] = item;
                            //Добавляем оргии с надписями поверх

                            // if (item.SignPointLongitude && item.SignPointLatitude && item.SignPointRadius && item.FloorID) {
                            //     var markerText = L.Marker.zoomingMarker(item);
                            //     markerText.on("click", function (e) {
                            //         $rootScope.currentOrganization = item;
                            //         clickToOrganization(item.OrganizationID);
                            //     });
                            //     $scope.mapFloors[item.FloorID].layerGroup.addLayer(markerText);
                            // }

                        });
                        //Устанавливаем терминал
                        $scope.setFloor($rootScope.currentTerminal.TerminalMapObject[0].MapObject.FloorID);

                        init();
                    });
                    $scope.getCount = function (floorID) {
                        var floor = $scope.mapFloors[floorID];
                        return $scope.selectedOrganizations === undefined ? 0 : $linq.Enumerable().From($scope.selectedOrganizations).SelectMany(i => i.Floors).Where(i => i.Number == floor.Number).Count(i => i.Count);
                    };
                    function getOptimalPath(array) {
                        let paths = {};
                        let mapObject = $rootScope.currentTerminal.TerminalMapObject[0].MapObject;
                        //Надписи не учитывем для посторения
                        array = array.filter(i => !i.ParamsAsJson || !i.ParamsAsJson.SignText);
                        array.forEach(i => {
                            let path = $rootScope.mapGraph.findPath(mapObject.Longitude, mapObject.Latitude, mapObject.FloorID, i.Longitude, i.Latitude, i.FloorID);
                            let sum = path[path.length - 1].dksLength;
                            paths[i.MapObjectID] = {
                                path: path,
                                sum: sum,
                                object: i
                            };
                        });
                        let result = $linq.Enumerable().From(paths).OrderBy(i => i.Value.sum).FirstOrDefault();

                        return result ? result.Value : null;
                    }

                    //Очистить выделение маркеров
                    function clearSelect(selector) {
                        document.querySelectorAll('._selected').forEach(m => {
                            m.classList.remove('_selected');
                        });
                        if (!$scope.currentMapFloor)
                            return;
                        let floorID = $scope.currentMapFloor.FloorID;
                        angular.forEach($scope.mapFloors, function (value, key) {
                            if (key != floorID)
                                value.clear = true;
                        });
                    }

                    //Выбран маршрут
                    var currentPathHandler = $rootScope.$watch('currentPath', function (n, o) {

                        //Очистка слоев с путями
                        for (let f in $scope.mapFloors) {
                            if ($scope.mapFloors[f].pathGroup)
                                $scope.mapFloors[f].pathGroup.clearLayers();
                        }

                        if ($rootScope.currentPath !== undefined && $rootScope.currentPath !== null) {

                            let maxZoom = map.getMaxZoom();
                            //Нужно выделить из несколько линий для каждого этажа
                            let currentFloor;
                            let currentLines = new Map();
                            let currentLine;
                            $rootScope.currentPath.forEach(path => {
                                if (currentFloor !== path.layer.layerID) {
                                    currentFloor = path.layer.layerID;
                                    if (currentLines.has(currentFloor))
                                        currentLine = currentLines.get(currentFloor);
                                    else {
                                        currentLine = [];
                                        currentLines.set(currentFloor, currentLine);
                                    }
                                }
                                currentLine.push(map.unproject([path.x, path.y], maxZoom));

                            });
                            let angle = $scope.options.orginalAngel == true ? 0 : ($rootScope.currentTerminal.LookDirectionAngleDegrees * 3.14 / 180);

                            //Теперь строим сами линии
                            currentLines.forEach((value, key, m) => {

                                let line = L.polyline(value, {color: 'red', className: 'path'});

                                let myMovingMarker = L.Marker.movingMarker(value, settings.manVelocity, {
                                    loop: true,
                                    autostart: true,
                                    angle: map._bearing,
                                    zIndexOffset: 700
                                });
                                let floor = $scope.mapFloors[key];
                                if (!floor.pathGroup)
                                    return;
                                floor.pathGroup.addLayer(line);
                                floor.pathGroup.addLayer(myMovingMarker);
                            });
                        }

                    });
                    let changeStatehandler = $rootScope.$on('$stateChangeSuccess',
                        function (event, toState, toParams, fromState, fromParams) {
                            if (toState.resetMap)
                                $scope.options.reset(toState);
                        });
                    let resetHandler = $rootScope.$on('resetMap', function () {
                        //map.fitBounds($scope.currentMapFloor.bound);
                        if ($state.current.resetMap)
                            $scope.options.reset($state.current);
                    });
                    $scope.$on("$destroy", function () {
                        //console.log('destroy map');
                        if ($scope.selectedOrganizations !== undefined) {
                            delete $scope.selectedOrganizations;
                        }
                        if ($scope.currentMapFloor !== undefined) {
                            if ($scope.currentMapFloor.layer)
                                map.removeLayer($scope.currentMapFloor.layer);
                            if ($scope.currentMapFloor.layerGroup)
                                map.removeLayer($scope.currentMapFloor.layerGroup);
                            if ($scope.currentMapFloor.pathGroup)
                                map.removeLayer($scope.currentMapFloor.pathGroup);
                            delete $scope.mapFloors;
                            delete $scope.mapOrganizations;
                            delete $scope.currentMapFloor.layer;
                            delete $scope.currentMapFloor.layerGroup;
                            delete $scope.currentMapFloor.pathGroup;
                            delete $scope.currentMapFloor;
                        }
                        changeStatehandler();
                        resetHandler();
                        formatThemeHandler();
                        currentPathHandler();
                        //_orginalAngel();
                        //_currentOrganizations();
                        map.removeEventListener();
                        map.remove();
                        map = null;
                        console.log('$destroy');
                    });
                    $scope.zoomIn = function () {
                        map.zoomIn();
                    };
                    $scope.zoomOut = function () {
                        map.zoomOut();
                    };
                    $scope.setFloor = function (floorID) {
                        if (floorID === undefined || ($scope.currentMapFloor !== undefined && floorID === $scope.currentMapFloor.FloorID))
                            return;
                        var floor = $scope.mapFloors[floorID];
                        if (floor !== undefined) {
                            if ($scope.currentMapFloor !== undefined) {
                                //if ($scope.currentMapFloor.layer && $scope.currentMapFloor.layer._map)
                                map.removeLayer($scope.currentMapFloor.layer);
                                //if ($scope.currentMapFloor.pathGroup && $scope.currentMapFloor.pathGroup._map)
                                map.removeLayer($scope.currentMapFloor.pathGroup);
                                //if ($scope.currentMapFloor.layerGroup && $scope.currentMapFloor.layerGroup._map)
                                map.removeLayer($scope.currentMapFloor.layerGroup);

                            }
                            floor.layer.addTo(map);
                            floor.pathGroup.addTo(map);
                            floor.layerGroup.addTo(map);
                            //map.setMaxBounds($rootScope.formatTheme == "formatTheme_horizontalSmall" ? floor.boundSmall : floor.bound);
                            if (floor.clear) {
                                document.querySelectorAll('._selected').forEach(m => {
                                    m.classList.remove('_selected');
                                });
                                delete floor.clear;
                            }
                            //console.time('selectedOrganizations');
                            if ($scope.selectedOrganizations && $scope.selectedOrganizations.length != 0) {
                                $scope.selectedOrganizations.forEach(org => {
                                    document.querySelectorAll('[data-org-id="' + org.OrganizationID + '"]').forEach(m => {
                                        m.classList.add('_selected');
                                    });
                                });
                            }
                            //console.timeEnd('selectedOrganizations');
                        }
                        $scope.currentMapFloor = floor;
                        setBounds();

                        //map.fitWorld();
                    };
                }
            };
        }
    ]);
})();