/**
 * Created by Nekrasov on 6/21/2017.
 */
(function () {
    'use strict';

    class DbVersionService {
        constructor($q, $http, settings, $linq, dbService) {
            this.$q = $q;
            this.$http = $http;
            this.settings = settings;
            this.$linq = $linq;
            this.dbService = dbService;
        }

        getToken() {
            let self = this;
            if (self.settings.token) {
                return self.$http({
                    method: 'POST',
                    url: self.settings.authUrl + `/Token`,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: `grant_type=password&username=${self.settings.serialNumber}&password=${self.settings.token}`
                }).then(response => response.data.access_token);
            }
            else {
                return self.dbService.getData().then(i => {
                    let floor = i.Floors.find(j => j.TerminalMapObject);
                    if (!floor || !floor.TerminalMapObject.Token) {
                        console.error('Нет терминала или в базе отсутствует токен');
                        return;
                    }
                    self.settings.token = floor.TerminalMapObject.Token;

                    return self.$http({
                        method: 'POST',
                        url: self.settings.authUrl + `/Token`,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: `grant_type=password&username=${encodeURIComponent(self.settings.serialNumber)}&password=${encodeURIComponent(self.settings.token)}`
                    }).then(response => {
                        localStorage.setItem('auth_token', angular.toJson(response.data));
                        return response.data.access_token;
                    });
                });
            }
        }

        checkDb() {
            let self = this;
            if (self.settings.preventDbCheck === true)
                return;
            self.dbService.getData().then(i => {
                if (!i.CreationDate) {
                    console.error('Нет даты создания базы');
                    return;
                }
                self.getToken().then(token => {
                    return self.$http.post(`${self.settings.webApiBaseUrl}/TerminalService/CheckDbVersion`, {
                        ClientTime: new Date(),
                        CreationDate: i.CreationDate
                    }, {
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        }
                    });
                }).then(i => {
                    console.info('Информация о версии базы данных успешно обновленна');
                });
            });
        }

    }

    angular
        .module('app')
        .service('dbVersionService', DbVersionService);

    DbVersionService.$inject = ['$q', '$http', 'settings', '$linq', 'dbService'];
})
();