/**
 * Created by Nekrasov on 5/26/2017.
 */
/**
 * Created by Nekrasov on 5/25/2017.
 */
(function () {
    'use strict';
    class DbService {
        constructor($q, $http, settings, $linq) {
            this.$q = $q;
            this.$http = $http;
            this.settings = settings;
            this.$linq = $linq;
        }

        getData() {
            let self = this;
            return self.$http.get(`Content/Backup/db/${self.settings.serialNumber}.json`, {cache: true}).then(i => i.data);
        }

        getOrganizationTypeSync(data, organization) {
            if (organization.Categories.length === 0 || organization.Categories.length > 1)
                return 'shop';

            let setting = data.SystemSettings.TERMINAL_MENU_ITEMS;
            let restaurantCategories = data.Categories[setting['Рестораны и кафе']].ChildIds;
            let entertainmentCategories = data.Categories[setting['Развлечения и услуги']].ChildIds;
            let serviceCategories = data.Categories[setting['Сервисы']].ChildIds;
            let categoryID = organization.Categories[0].CategoryID;
            let type;
            if (serviceCategories.includes(categoryID)) {
                type = 'service';
            } else if (entertainmentCategories.includes(categoryID)) {
                type = 'entertainment';
            } else if (restaurantCategories.includes(categoryID)) {
                type = 'restaurant';
            } else {
                type = 'shop';
            }
            return type;
        }

        categoryGetByTypeSync(data, type) {
            let setting = data.SystemSettings.TERMINAL_MENU_ITEMS;
            if (type === 'Рестораны и кафе' || type === 'restaurant') {
                return data.Categories[setting['Рестораны и кафе']];
            }
            if (type === 'Развлечения и услуги' || type === 'entertainment') {
                return data.Categories[setting['Развлечения и услуги']];
            }
            if (type === 'Сервисы' || type === 'service') {
                return data.Categories[setting['Сервисы']];
            }
            if (type === 'Магазины' || type === 'shop') {
                return data.Categories[setting['Магазины']];
            }
        }

        organizationGetFilter(filter = '', categoryID = '') {
            let self = this;
            return self.getData().then(data => {
                let result = self.$linq.Enumerable().From(data.Organizations).Select(i => i.Value);
                if (categoryID) {
                    let category = data.Categories[categoryID];
                    let ln = self.$linq.Enumerable().From(category.ChildIds);
                    result = result.Where(i => ln.Intersect(i.Categories.map(j => j.CategoryID)).Count() !== 0);
                }
                if (filter) {
                    filter = filter.toLocaleLowerCase();
                    result = result.Where(i => i.Name.toLowerCase().includes(filter) || i.KeyWords.toLowerCase().includes(filter))
                }
                return result.ToArray();
            });
        }

        organizationGetById(organizationID) {
            let self = this;
            return self.getData().then(data => {
                let organization = data.Organizations[organizationID];
                if (organization === undefined)
                    return null;

                organization.OrganizationType = self.getOrganizationTypeSync(data, organization);
                return organization;
            });
        }

        //{HasProposals:true, Categories:[]}
        organizationGetDetailFilter(filter) {
            let self = this;
            return self.getData().then(data => {
                let result = self.$linq.Enumerable().From(data.Organizations);
                if (filter.HasProposals == true) {
                    result = result.Where(i => i.Proposals.length !== 0)
                }
                result = result.Where(i => ln.Intersect(filter.Categories).Count() !== 0);
                return result.ToArray();
            });
        }

        eventGetCurrent() {
            let self = this;
            return self.getData().then(data => {
                let result = self.$linq.Enumerable().From(data.Events).Select(i => i.Value);
                let date = new Date();
                result = result.Where(i => (moment(i.DateBegin).isBefore(date)) && (moment(i.DateEnd).isAfter(date)))
                    .OrderBy(i => i.DateEnd)
                    .Take(2);
                return result.Select(i => i.EventID).ToArray();
            });
        }

        systemSettingGetMenuItems() {
            let self = this;
            return self.getData().then(data => data.SystemSettings.TERMINAL_MENU_ITEMS);
        }
    }
    angular
        .module('app')
        .service('dbService', DbService);

    DbService.$inject = ['$q', '$http', 'settings', '$linq'];
})();