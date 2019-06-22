'use strict';

angular.module('supportAdminApp')
    .factory('DayDefiniteValueService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            var API_URL = $const.API_URL;
            var DayDefiniteValueService = {};

            DayDefiniteValueService.retrieveTrendencyRecord = function (searchCondition) {
                var payload = JSON.stringify(searchCondition);
                var request = $http({
                    method: 'POST',
                    //url: MY_API_URL + "/analyze/gear/value",
                    url: API_URL + '/analyze/gear/value',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
                });
                return request.then(
                    function (response) {
                        return DayDefiniteValueService.createRecord(response.data.data);
                    },
                    function (error) {
                        return $q.reject({error: error});
                    }
                );
            };

            DayDefiniteValueService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data.list, function (elem) {
                    var item = DayDefiniteValueService.transferResult(elem);
                    if (!(item === -1)) {
                        result = result.concat(item);
                    }
                });
                content.result = result;
                content.pages = data.pages;
                content.pageNum = data.pageNum;
                return content;
            };

            DayDefiniteValueService.transferResult = function (elem) {
                var dataListLength = elem.dataList.length;
                if (dataListLength == 0) {
                    return -1
                }
                var Record = function () {
                };
                var records = [];
                var record = {};
                record.trainId = elem.trainId;
                record.trainDirection = elem.trainDirection === 0 ? "转3回厂" : "下行";
                record.trainDate = elem.trainDate.slice(0, 4) + '-' + elem.trainDate.slice(4, 6) + '-' + elem.trainDate.slice(6, 8) + ' ' +
                    elem.trainDate.slice(8, 10) + ':' + elem.trainDate.slice(10, 12) + ':' + elem.trainDate.slice(12, 14);
                for (var i = 0; i < dataListLength; i++) {
                    record.gearNum = elem.dataList[i].gearNum;
                    record.motorNum = elem.dataList[i].motorNum;
                    record.lgapValue = fix_number(elem.dataList[i].lgapValue);
                    record.rgapValue = fix_number(elem.dataList[i].rgapValue);
                    records.push(angular.extend(new Record(), record));
                }
                return records;
            }

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }

            return DayDefiniteValueService;
        }]);
