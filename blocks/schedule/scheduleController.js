(function () {
    "use strict";

    class ScheduleController {
        constructor($state, dbService) {
            let self = this;
            dbService.getData().then(i => {
                self.Customer = i.Customer;

                let date = new Date().getDay() - 1;
                if (date < 0)
                    date = 6;
                self.Schedule = self.Customer.Schedule[date];

                self.anchorOrganizations = Object.values(i.Organizations).filter(o => o.IsAnchor === true && o.Schedule != null);
                self.anchorOrganizations.forEach(i => {
                    try {
                        const schedule = JSON.parse(i.Schedule);
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
                            i.displaySchedule.push(self.getDisplaySchedule(lp));
                        });
                    }
                    catch (exc) {
                        return;
                    }
                });
            });
        };

        getDisplayWorkTime(schedule) {
            if (schedule.fromTime.trim() == schedule.toTime.trim())
                return "круглосуточно";
            else
                return schedule.fromTime.substring(0, 5) + "-" + schedule.toTime.substring(0, 5);
        };

        getDisplaySchedule(schedule) {
            var days = "";
            switch (schedule.listDays.length) {
                case 1:
                    return {type: schedule.listDays[0].day, schedule: this.getDisplayWorkTime(schedule)};
                case 2:
                    return {
                        type: schedule.listDays[0].day + " и " + schedule.listDays[1].day,
                        schedule: this.getDisplayWorkTime(schedule)
                    };
                case 3: {
                    if (Math.abs(schedule.listDays[0].num - schedule.listDays[1].num) == 1 && Math.abs(schedule.listDays[1].num - schedule.listDays[2].num) == 1)
                        return {
                            type: schedule.listDays[0].day + "-" + schedule.listDays[2].day,
                            schedule: this.getDisplayWorkTime(schedule)
                        };
                    else
                        return {
                            type: schedule.listDays[0].day + ", " + schedule.listDays[1].day + ", " + schedule.listDays[2].day,
                            schedule: this.getDisplayWorkTime(schedule)
                        };
                }
                default:
                    return {
                        type: 'Основное', schedule: this.getDisplayWorkTime(schedule)
                    };
            }
        };
    }

    ScheduleController.$inject = ['$state', 'dbService'];
    angular.module('app').controller('scheduleController', ScheduleController);
})();