'use strict';

angular.module('supportAdminApp')
    .factory('ReportSearchService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var ReportSearchService = {};

            ReportSearchService.retrieveRecord = function (searchCondition) {
                var payload = JSON.stringify(searchCondition);

                var request = $http({
                    method: 'POST',
                    url: API_URL + '/history/report',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return ReportSearchService.createRecord(response.data.data);
                        }
                        else {
                            return response.data.msg;
                        }
                    },
                    function (error) {
                        return $q.reject({error: error});
                    }
                );
            };


            ReportSearchService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data.list, function (elem) {
                    result = result.concat(ReportSearchService.transferResult(elem));
                });
                content.result = result;
                content.pages = data.pages;
                content.pageNum = data.pageNum;
                return content;
            };

            ReportSearchService.transferResult = function (elem) {
                var Record = function () {
                };
                var records = [];
                var record = {};

                record.carriageNum = elem.carriageNum;

                record.wheelNum = elem.wheelNum ? elem.wheelNum : null;
                record.jfgValue = elem.jfgValue ? elem.jfgValue : null;
                record.fzValue = elem.fzValue ? elem.fzValue : null;
                record.fzyzValue = elem.fzyzValue ? elem.fzyzValue : null;
                record.qdValue = elem.qdValue ? elem.qdValue : null;
                record.qdyzValue = elem.qdyzValue ? elem.qdyzValue : null;

                record.trainDate = elem.trainDate.slice(0, 4) + '-' + elem.trainDate.slice(4, 6) + '-' + elem.trainDate.slice(6, 8) + ' ' +
                    elem.trainDate.slice(8, 10) + ':' + elem.trainDate.slice(10, 12) + ':' + elem.trainDate.slice(12, 14);

                record.motorNum = elem.motorNum ? elem.motorNum : null;
                record.motorTemp = elem.motorTemp ? elem.motorTemp : null;

                records.push(angular.extend(new Record(), record));
                return records;
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }

            return ReportSearchService;
        }]);
