(function () {
    "use strict";
    angular.module('app').filter('calcRemainPeriod', function () {
        let day = function (days) {
            let expressions = ['день', 'дня', 'дней'];
            let result;
            let count = days % 100;
            if (count >= 5 && count <= 20) {
                result = expressions[2];
            } else {
                count = count % 10;
                if (count == 1) {
                    result = expressions[0];
                } else if (count >= 2 && count <= 4) {
                    result = expressions[1];
                } else {
                    result = expressions[2];
                }
            }
            return result;
        };

        return function (start, stop) {
            let st = moment(start);
            let end = moment(stop);
            let now = moment();

            if (st.isAfter() && stop == null) {
                return {
                    date: `${st.format('DD MMMM')}`, period: false, toString: function () {
                        return this.date;
                    }
                };
            }
            let remain = end.diff(now, 'days');
            if (now.isBetween(st, end)) {
                if (remain <= 20)
                    return {
                        date: `${remain} ${day(remain)}`, period: true, toString: function () {
                            return this.date;
                        }
                    };
                else
                    return {
                        date: `${st.format('DD MMMM')} - ${end.format('DD MMMM')}`,
                        period: false,
                        toString: function () {
                            return this.date;
                        }
                    };
            }
            if (st.isAfter() && stop != null) {
                return {
                    date: `${st.format('DD MMMM')} - ${end.format('DD MMMM')}`, period: false, toString: function () {
                        return this.date;
                    }
                };
            }
            return '';
        }
    });
})();