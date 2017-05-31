(function () {
    "use strict";
    const constants = {
        Terminal: 0,
        Link: 1,
        Service: 2
    };

    angular.module('app').directive("molokoMap", [
        '$rootScope', '$http', '$q', 'settings', '$linq', '$state', '$stateParams', '$timeout', 'mainMenuService', 'categoryService', 'dbService', function ($rootScope, $http, $q, settings, $linq, $state, $stateParams, $timeout, mainMenuService, categoryService, dbService) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    options: '=options'
                },
                templateUrl: 'blocks/mapControl/molokoMap.html',
                link: function ($scope, element, attrs) {

                    let scale = settings.mapScale;

                    $scope.rootScope = $rootScope;
                    if (!$scope.options)
                        $scope.options = {minZoom: 17, maxZoom: 23};
                    let elm = element[0].children[0];

                    // Инициализируем карту Leaflet
                    let map = L.map(elm, {
                        //rotate: true,
                        minZoom: $scope.options.minZoom,
                        maxZoom: $scope.options.maxZoom,
                        zoomControl: false,
                        attributionControl: false,
                        markerZoomAnimation: false,
                        crs: L.CRS.Simple,
                        //crs: L.CRS.Earth,
                        inertia: false,
                        bounceAtZoomLimits: true,
                        fadeAnimation: false,
                    });

                    map.setView([55.655660, 37.845882], 17);
                    //Сброс карты
                    $scope.options.reset = function (data) {
                        delete $scope.selectedOrganizations;
                        $scope.setFloor($rootScope.currentTerminal.FloorID);
                        setBounds(data);
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
                        return count;
                    }

                    function setBounds() {
                        //return;
                        map.invalidateSize();
                        let bounds = $scope.currentMapFloor.layerGroup.getBounds(); // layer.getBounds();
                        map.fitBounds(bounds, {
                            paddingTopLeft: [50, 50],
                            paddingBottomRight: [50, 50],
                            reset: true,
                            animate: false
                        });
                        calculateBounds();
                    };
                    // Задаем обработчики событий
                    map.on("click", function (e) {
                        let floorID = $scope.currentMapFloor.FloorID;
                        let currentPoint = map.project(e.latlng);

                        let tmp = $linq.Enumerable().From($scope.mapFloors[floorID].layerGroup.getLayers())
                            .Where(i => i._organization)
                            .Select(i => {
                                return {
                                    Distance: currentPoint.distanceTo(map.project(i.getLatLng())),
                                    OrganizationID: i._organization.OrganizationID,
                                    MapObjectID: i._mapObject.MapObjectID
                                }
                            }).Where(i => i.Distance <= 50).OrderBy(i => i.Distance).FirstOrDefault();
                        if (tmp) {
                            if ($rootScope.currentOrganization && $rootScope.currentOrganization.OrganizationID === tmp.OrganizationID || tmp.OrganizationID === $rootScope.currentTerminal.OrganizationID) {
                                return;
                            }
                            clickToOrganization(tmp.OrganizationID, tmp.MapObjectID);
                        }
                        return;

                        // let filtered = $linq.Enumerable().From($scope.mapFloors[floorID].floorMapObjects).Select(i => {
                        //     return {
                        //         OrganizationID: i.Key,
                        //         MapObject: $linq.Enumerable().From(i.Value).Select(j => {
                        //             return {
                        //                 Distance: currentPoint.distanceTo(map.project(j.position)),
                        //                 MapObjectID: j.mapObjectID
                        //             };
                        //         }).OrderBy(j => j.Distance).FirstOrDefault()
                        //     };
                        // }).Where(i => i.MapObject.Distance <= 50).OrderBy(i => i.MapObject.Distance).ToArray();
                        //
                        // if (filtered[0] !== undefined) {
                        //     if ($rootScope.currentOrganization && $rootScope.currentOrganization.OrganizationID === filtered[0].OrganizationID || filtered[0].OrganizationID === $rootScope.currentTerminal.OrganizationID) {
                        //         return;
                        //     }
                        //     clickToOrganization(filtered[0].OrganizationID, filtered[0].MapObject.MapObjectID);
                        // }
                    });
                    function calculateBounds(offset) {
                        map.setMaxBounds($scope.currentMapFloor.layer.getBounds());
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
                        dbService.organizationGetById(orgID).then(organization => {
                            $state.go('navigation.' + organization.OrganizationType, {
                                OrganizationID: orgID,
                                MapObjectID: mapObjectID
                            });
                        });
                    };
                    //Изменение маршрута
                    let stateChangeHandler = $rootScope.$on('$stateChangeSuccess',
                        function (event, toState, toParams, fromState, fromParams) {
                            if (toState.resetMap)
                                $scope.options.reset(toState);

                            clearSelect();
                            if ($state.params.OrganizationID) {
                                dbService.organizationGetById($state.params.OrganizationID).then(organization => {
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
                                        mapObjects = $rootScope
                                            .organizations
                                            .find(i => i.OrganizationID == $state.params.OrganizationID)
                                            .OrganizationMapObject
                                            .map(i => i.MapObject);
                                    }
                                    // $scope.mapOrganizations[$rootScope.currentOrganization.OrganizationID].marker.setIcon(markerIcon);

                                    $scope.selectedOrganizations = [organization];
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
                                });
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

                    dbService.getData().then(i => {
                        $scope.mapFloors = {};
                        $scope.mapOrganizations = {};
                        $scope.mapObjects = {};

                        $rootScope.currentTerminal = i.Floors.find(j => j.TerminalMapObject).TerminalMapObject;

                        i.Floors.forEach(item => {
                            let size = map.getSize();
                            let range = getZoomRange(item.Width, item.Height, size.x * 0.3, size.y);
                            //TODO Тут надо подумать пока будем брать максимальный зум
                            if (map.options.maxZoom < map.options.minZoom + range)
                                map.options.maxZoom = map.options.minZoom + range;

                            let value = {width: item.Width, height: item.Height};
                            let southWest = map.unproject([-value.width * scale / 2, value.height * scale / 2], map.getMaxZoom());
                            let northEast = map.unproject([value.width * scale / 2, -value.height * scale / 2], map.getMaxZoom());
                            let angle = $rootScope.currentTerminal.Params.LookDirectionAngleDegrees || 0;

                            angle = `${angle === 0 ? '' : 'D_' + angle}`;

                            item.layer = L.imageOverlay(`${settings.resourceFolder}/Floors/${item.FloorID}${angle}.${item.FileExtension}`, new L.LatLngBounds(southWest, northEast)/*[southWest, northEast]*/);

                            item.layerGroup = L.featureGroup();
                            item.pathGroup = L.layerGroup();
                            item.floorMapObjects = {};
                            $scope.mapFloors[item.FloorID] = item;

                            item.OrganizationMapObjects.forEach(mapObject => {
                                mapObject.MapObject.Latitude = mapObject.MapObject.Latitude * scale;
                                mapObject.MapObject.Longitude = mapObject.MapObject.Longitude * scale;

                                let position = map.unproject([mapObject.MapObject.Longitude, mapObject.MapObject.Latitude], map.getMaxZoom());

                                let mapObjectType = dbService.mapObjectGetTypeSync(i, mapObject);
                                let marker;
                                let category;
                                switch (mapObjectType) {
                                    case 'zooming':
                                        mapObject.MapObject.Params.SignPointRadius = mapObject.MapObject.Params.SignPointRadius * scale;
                                        marker = L.Marker.zoomingMarker(mapObject.MapObject);
                                        marker.on("click", function (e) {
                                            clickToOrganization(mapObject.Organization.OrganizationID);
                                        });
                                        break;
                                    case 'toilet':
                                        category = mapObject.Organization.Categories[0];
                                        marker = L.marker(position, {
                                            icon: L.divIcon({
                                                className: 'marker',
                                                html: `<div><img class="marker__image marker__wc}" src="${settings.resourceFolder}/Categories/${category.CategoryID}.${category.LogoExtension}" data-org-id="${mapObject.Organization.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"/></div>`,
                                                iconSize: [16, 16]
                                            }),
                                            title: mapObject.Organization.Name,
                                            iconSize: [16, 16],
                                            zIndexOffset: 10
                                        });
                                        marker._organization = mapObject.Organization;
                                        marker._mapObject = mapObject.MapObject;
                                        break;
                                    case 'serviceObject':
                                        category = mapObject.Organization.Categories[0];
                                        marker = L.marker(position, {
                                            icon: L.divIcon({
                                                className: 'marker',
                                                html: `<div><img class="marker__image" src="${settings.resourceFolder}/Categories/${category.CategoryID}.${category.LogoExtension}" data-org-id="${mapObject.Organization.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"/></div>`,
                                                iconSize: [16, 16]
                                            }),
                                            title: mapObject.Organization.Name,
                                            iconSize: [16, 16],
                                            zIndexOffset: 10
                                        });
                                        marker._organization = mapObject.Organization;
                                        marker._mapObject = mapObject.MapObject;
                                        break;
                                    case "entertainment":
                                    case "service":
                                        marker = L.Marker.iconShowMarker(mapObject.MapObject, mapObject.Organization, {
                                            src: 'Content/images/card_enterteinment_logo_holder.png'
                                        });
                                        break;
                                    case "shop":
                                        marker = L.Marker.iconShowMarker(mapObject.MapObject, mapObject.Organization, {
                                            src: 'Content/images/card_shop_logo_holder.png'
                                        });
                                        break;
                                    case "restaurant":
                                        marker = L.Marker.iconShowMarker(mapObject.MapObject, mapObject.Organization, {
                                            src: 'Content/images/card_food_logo_holder.png'
                                        });
                                        break;
                                }
                                if (marker)
                                    $scope.mapFloors[mapObject.MapObject.FloorID].layerGroup.addLayer(marker);

                                $scope.mapObjects[mapObject.MapObject.MapObjectID] = mapObject.MapObject;
                            });

                            $scope.mapOrganizations[item.OrganizationID] = item;
                        });


                        //map.setMaxBounds(item.layer.getBounds());
                        let terminalOrg = $rootScope.currentTerminal;
                        let position = map.unproject([terminalOrg.Longitude * scale, terminalOrg.Latitude * scale], map.getMaxZoom());
                        terminalOrg.marker = L.marker(position, {
                            icon: L.divIcon({
                                className: 'marker',
                                html: `<div data-map-id="${$rootScope.currentTerminal.MapObjectID}"><img style="width:40px;margin-top: -60px;margin-left: -10px;" src="Content/images/youHere.png"/></div>`,
                                iconSize: [16, 16]
                            }),
                            title: terminalOrg.Name,
                            iconSize: [16, 16],
                            zIndexOffset: 400
                        });
                        $scope.mapFloors[terminalOrg.FloorID].layerGroup.addLayer(terminalOrg.marker, {pane: 'tilePane'});
                        $scope.mapOrganizations[terminalOrg.OrganizationID] = terminalOrg;
                        $scope.options.zoom = map.getZoom();


                        $scope.setFloor($rootScope.currentTerminal.FloorID);
                    });

                    $scope.getCount = function (floorID) {
                        var floor = $scope.mapFloors[floorID];
                        if ($scope.selectedOrganizations === undefined || $scope.selectedOrganizations.length === 0)
                            return 0;
                        if ($scope.selectedOrganizations[0].Floors == undefined) {
                            return $linq.Enumerable().From($scope.selectedOrganizations).SelectMany(i => i.Floors).Select(i => i.MapObject.FloorID).Where(i => i == floorID).Count();
                        }
                        else
                            return $linq.Enumerable().From($scope.selectedOrganizations).SelectMany(i => i.Floors).Where(i => i.Number === floor.Number).Count();
                    };
                    function getOptimalPath(array) {
                        let paths = {};
                        let mapObject = $rootScope.currentTerminal;
                        //Надписи не учитывем для посторения
                        array = array.filter(i => !i.Params || !i.Params.SignText);
                        array.forEach(i => {
                            let path = $rootScope.mapGraph.findPath(mapObject.Longitude * settings.mapScale, mapObject.Latitude * settings.mapScale, mapObject.FloorID, i.Longitude, i.Latitude, i.FloorID);
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
                            //Теперь строим сами линии
                            currentLines.forEach((value, key, m) => {
                                let line = L.polyline(value, {color: 'red', className: 'path'});
                                //settings.manVelocity * 0.000018
                                let myMovingMarker = L.Marker.movingMarker(value, settings.manVelocity * 2, {
                                    loop: true,
                                    autostart: true,
                                    zIndexOffset: 700,
                                    startZoomLevel: (map.getZoom() - map.getMinZoom())
                                });
                                let floor = $scope.mapFloors[key];
                                if (!floor.pathGroup)
                                    return;
                                floor.pathGroup.addLayer(line);
                                floor.pathGroup.addLayer(myMovingMarker);
                            });
                        }

                    });
                    let resetHandler = $rootScope.$on('resetMap', function () {
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
                        currentPathHandler();
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
                                map.removeLayer($scope.currentMapFloor.layer);
                                map.removeLayer($scope.currentMapFloor.pathGroup);
                                map.removeLayer($scope.currentMapFloor.layerGroup);
                            }
                            floor.layer.addTo(map);
                            floor.pathGroup.addTo(map);
                            floor.layerGroup.addTo(map);
                            if (floor.clear) {
                                document.querySelectorAll('._selected').forEach(m => {
                                    m.classList.remove('_selected');
                                });
                                delete floor.clear;
                            }
                            //console.time('selectedOrganizations');
                            if ($scope.selectedOrganizations && $scope.selectedOrganizations.length !== 0) {
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
                    };
                }
            };
        }
    ]);
})();