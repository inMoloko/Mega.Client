(function () {
    'use strict';
    var service = function ($rootScope, $http, settings) {
        this._$http = $http;
        this._settings = settings;
    };
    service.prototype.post = function (feedback) {
        var self = this;
        return self._$http.post(this._settings.webApiBaseUrl + '/Feedback/?CustomerID=' + self._settings.customerID,
            {
                FeedbackCommentText: feedback.text + '\nОценка: ' + feedback.rating,
                ApplicantName: 'MEGA client',
                FeedbackMark: feedback.rating > 3 ? "good" : "bad",
                SelectedFeedbackCategory:1
            });
    };
    service.$inject = ['$rootScope', '$http', 'settings'];
    angular.module('app').service('feedbackService', service);
})();