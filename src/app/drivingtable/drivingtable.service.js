'use strict';

angular.module('supportAdminApp')
    .factory('DrivingTableService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {

            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var DrivingTableService = {};

            DrivingTableService.retrieveRecord = function (searchCondition) {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/table/report/' + searchCondition.pre + '/' + searchCondition.page + '/' + searchCondition.pageSize,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        if (response.data.code == 0) {
                            return DrivingTableService.createRecord(response.data.data);
                        }
                        else {
                            return response.data.msg;
                        }
                    },
                    function (error) {
                        return $q.reject({ error: error });
                    }
                );
            };

            DrivingTableService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data.list, function (elem) {
                    result = result.concat(DrivingTableService.transferResult(elem));
                });
                content.result = result;
                content.pages = data.pages;
                content.pageNum = data.pageNum;
                return content;
            };

            DrivingTableService.transferResult = function (elem) {
                var Record = function () { };
                var records = [];
                var record = {};

                record.trainId = elem.trainId;
                record.trainOnlyId = elem.trainOnlyid;

                record.lunjing = elem.lunjing;
                record.lunjingState = elem.lunjingState;
                record.lungao = elem.lungao;
                record.lungaoState = elem.lungaoState;
                record.lunhou = elem.lunhou;
                record.lunhouState = elem.lunhouState;
                record.qrValue = elem.qrValue;
                record.qrValueState = elem.qrValueState;
                record.zhoucha = elem.zhoucha;
                record.zhouchaState = elem.zhouchaState;
                record.jiacha = elem.jiacha;
                record.jiachaState = elem.jiachaState;
                record.checha = elem.checha;
                record.chechaState = elem.chechaState;

                record.trainState = $const.TRAIN_STATE_V[elem.trainState];

                record.trainDate = elem.trainDate.slice(0, 4) + '-' + elem.trainDate.slice(4, 6) + '-' + elem.trainDate.slice(6, 8) + ' ' +
                    elem.trainDate.slice(8, 10) + ':' + elem.trainDate.slice(10, 12) + ':' + elem.trainDate.slice(12, 14);

                records.push(angular.extend(new Record(), record));
                return records;
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }
            return DrivingTableService;
        }]);
