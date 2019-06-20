'use strict';

angular.module('supportAdminApp')
    .factory('AnalysisSpotService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;
            var AnalysisSpotService = {};

            AnalysisSpotService.retrieveRecord = function(searchCondition) {
                if(searchCondition.trainId === "全部"){
                    searchCondition.trainId ="all";
                }
                var payload = JSON.stringify(searchCondition);

                var request = $http({
                    method: 'POST',
                    url: API_URL + '/analysis/spot',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return response.data.data;
                        }
                        else {
                            return response.data.msg;
                        }
                    },
                    function (error) {
                        console.log(error);
                        return $q.reject({error: error});
                    }
                );
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }

            return AnalysisSpotService;
        }]);
