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
                        $scope.options = {minZoom: 15, maxZoom: 21};
                    let elm = element[0].children[0];


                    L.Map = L.Map.extend({
                        convertPosition: function (mapObject) {
                            let self = this;
                            if (settings.useGeo) {
                                return new L.LatLng(mapObject.Latitude, mapObject.Longitude);
                            }
                            else {
                                return self.unproject([mapObject.MapObject.Longitude, mapObject.MapObject.Latitude], self.getMaxZoom());
                            }
                        },
                        offsetLng(latlng, dist) {
                            let R = 6371000; //earth’s radius in metres
                            let brng = Math.PI / 2;
                            let d = dist; //Distance in m

                            let lat1 = latlng.lat * Math.PI / 180;
                            let lng1 = latlng.lng * Math.PI / 180;
                            let lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
                            let lng2 = (lng1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2))) * 180 / Math.PI;

                            return L.latLng(latlng.lat, lng2);
                        }
                    });

                    //Поворот https://github.com/fnicollet/Leaflet/tree/rotate-master
                    // Инициализируем карту Leaflet
                    let map = L.map(elm, {
                        rotate: true,
                        minZoom: $scope.options.minZoom,
                        maxZoom: $scope.options.maxZoom,
                        zoomControl: false,
                        attributionControl: false,
                        markerZoomAnimation: false,
                        //crs: L.CRS.Simple,
                        //crs: L.CRS.Earth,
                        inertia: false,
                        bounceAtZoomLimits: false,
                        fadeAnimation: false,
                    });

                    //L.control.zoom({position: 'topright'}).addTo(map);
                    map.setView([55.65903192, 37.8472988867064], 16);
                    // map.setBearing(180);
                    // L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    // // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                    //     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                    //     maxZoom: 18,
                    //     //crs: L.CRS.Simple,
                    //     //light-v9
                    //     id: 'mapbox.streets',
                    //     accessToken: 'pk.eyJ1IjoicGl0Y2hjb250cm9sIiwiYSI6ImNqM2gzMml2ajAwMXIzMm83bmgwY3g2Z2QifQ.UAogEsttp6b9eij_Qs5jZQ'
                    // }).addTo(map);


                    //Сброс карты
                    $scope.options.reset = function (data) {
                        delete $scope.selectedOrganizations;
                        if ($rootScope.currentTerminal !== undefined && $rootScope.currentTerminal.FloorID !== undefined)
                            $scope.setFloor($rootScope.currentTerminal.FloorID);
                        setBounds(data);
                    };

                    $rootScope.$on('reset-map', function () {
                        $scope.options.reset();
                    });

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
                        let s = $linq.Enumerable().From($scope.currentMapFloor.layerGroup._layers).Select(i => i.Value).Select(i => i._latlng.lat + ', ' + i._latlng.lng + ', ' + i._mapObject.MapObjectID + angular.toJson(i._mapObject.Params));
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
                                        // mapObjects = $rootScope
                                        //     .organizations
                                        //     .find(i => i.OrganizationID == $state.params.OrganizationID)
                                        //     .OrganizationMapObject
                                        //     .map(i => i.MapObject);
                                        mapObjects = organization.MapObjects.map(i => $scope.mapObjects[i.MapObjectID]);
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

                            } else {
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
                            }

                        });

                    dbService.getData().then(i => {
                        $scope.mapFloors = {};
                        $scope.mapOrganizations = {};
                        $scope.mapObjects = {};

                        $scope.currentTerminal = $rootScope.currentTerminal = i.Floors.find(j => j.TerminalMapObject).TerminalMapObject;

                        map.setBearing($rootScope.currentTerminal.Params.LookDirectionAngleDegrees || 0);

                        i.Floors.forEach(item => {
                            let size = map.getSize();
                            // let range = getZoomRange(item.Width, item.Height, size.x * 0.3, size.y);
                            // //TODO Тут надо подумать пока будем брать максимальный зум
                            // if (map.options.maxZoom < map.options.minZoom + range)
                            //     map.options.maxZoom = map.options.minZoom + range;

                            let value = {width: item.Width, height: item.Height};
                            let southWest;
                            let northEast;
                            if (settings.useGeo) {
                                //55.660218, 37.841953
                                //southWest = new L.LatLng(55.651865817248584, 37.840454578399665);
                                southWest = new L.LatLng(item.SouthWest.Latitude * scale, item.SouthWest.Longitude * scale);

                                //55.651641, 37.847854
                                //northEast = new L.LatLng(55.65998866731282, 37.84931659698487);
                                northEast = new L.LatLng(item.NorthEast.Latitude * scale, item.NorthEast.Longitude * scale);

                            }
                            else {
                                southWest = map.unproject([-value.width * scale / 2, value.height * scale / 2], map.getMaxZoom());
                                northEast = map.unproject([value.width * scale / 2, -value.height * scale / 2], map.getMaxZoom());
                            }


                            let angle = $rootScope.currentTerminal.Params.LookDirectionAngleDegrees || 0;

                            angle = `${angle === 0 ? '' : 'D_' + angle}`;

                            item.layer = L.imageOverlay(`${settings.resourceFolder}/Floors/${item.FloorID}.${item.FileExtension}`, new L.LatLngBounds(southWest, northEast)/*[southWest, northEast]*/);

                            item.layerGroup = L.featureGroup();
                            item.pathGroup = L.layerGroup();
                            item.floorMapObjects = {};
                            $scope.mapFloors[item.FloorID] = item;

                            item.OrganizationMapObjects.forEach(mapObject => {
                                mapObject.MapObject.Latitude = mapObject.MapObject.Latitude * scale;
                                mapObject.MapObject.Longitude = mapObject.MapObject.Longitude * scale;

                                let position = map.convertPosition(mapObject.MapObject); // map.unproject([mapObject.MapObject.Longitude, mapObject.MapObject.Latitude], map.getMaxZoom());

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
                                                html: `<div><img class="marker__image marker__wc}" src="${settings.resourceFolder}/Categories/${category.CategoryID}.${category.LogoExtension || 'png'}" data-org-id="${mapObject.Organization.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"/></div>`,
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
                                        if (mapObject.Organization.Categories.length === 1) {
                                            category = mapObject.Organization.Categories[0];
                                        }
                                        else {
                                            let service = i.SystemSettings.TERMINAL_MENU_ITEMS['Сервисы'] || -1;
                                            category = mapObject.Organization.Categories.find(j => j.CategoryID !== service);
                                        }
                                        marker = L.marker(position, {
                                            icon: L.divIcon({
                                                className: 'marker',
                                                html: `<div><img class="marker__image" src="${settings.resourceFolder}/Categories/${category.CategoryID}.${category.LogoExtension || 'png'}" data-org-id="${mapObject.Organization.OrganizationID}" data-map-id="${mapObject.MapObject.MapObjectID}"/></div>`,
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
                        let position = map.convertPosition(terminalOrg);// map.unproject([terminalOrg.Longitude * scale, terminalOrg.Latitude * scale], map.getMaxZoom());
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

                        if (i.SystemSettings.TERMINAL_SETTINGS) {
                            const settings = i.SystemSettings.TERMINAL_SETTINGS;
                            if (settings.minZoom) {
                                map.setMinZoom(settings.minZoom);
                            }
                            if (settings.maxZoom) {
                                map.setMaxZoom(settings.maxZoom);
                            }
                        }
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
                                currentLine.push(map.convertPosition({Longitude: path.x, Latitude: path.y})); // unproject([path.x, path.y], maxZoom));

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