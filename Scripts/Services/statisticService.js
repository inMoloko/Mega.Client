/**
 * Created by Nekrasov on 5/25/2017.
 */
(function () {
    'use strict';
    class StatisticService {
        constructor($q, $indexedDB, $http) {
            this.$q = $q;
            this.$indexedDB = $indexedDB;
            this.$http = $http;
        }

        addStatistic(statics) {
            let self = this;
            self.$indexedDB.openStore('statistics', (store) => {
                store.insert(statics).then(() => {
                    console.log('insert');
                }, err => {
                    console.error(err);
                });
            });
        }

        getAll() {
            let self = this;
            let deferred = self.$q.defer();
            self.$indexedDB.openStore('statistics', (store) => {
                store.getAll().then(statistics => {
                    deferred.resolve(statistics);
                });
            });
            return deferred.promise;
        }

        sendStatistics() {
            let self = this;
            self.$indexedDB.openStore('statistics', (store) => {
                store.getAll().then(statistics => {
                    //TODO Сделать по нормальному
                    $http({
                        method: 'POST',
                        url: settings.webApiBaseUrl + '/Statistic',
                        data: statistics,
                        headers: {'Content-type': 'application/json'}
                    }).then(function (response) {
                        statistics.forEach(st => {
                            store.delete(st.Date);
                        });
                    }, function (response) {
                        //$rootScope.addStatistics('SendStatistics', '{"Param":"Not sended"}');
                        console.error("При отправке статистики произошла ошибка");
                    });
                });
            });

        }
    }
    angular
        .module('app')
        .service('statisticService', StatisticService);

    StatisticService.$inject = ['$q', '$indexedDB', '$http'];
})();