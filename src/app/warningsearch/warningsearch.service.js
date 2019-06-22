'use strict';

angular.module('supportAdminApp')
    .factory('WarningSearchService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var WarningSearchService = {};

            WarningSearchService.retrieveRecord = function (searchCondition) {
                var suffix;
                if (searchCondition.selectType < 4) {
                    suffix = '/history/tableOne';
                } else {
                    suffix = '/history/tableTwo';
                    searchCondition.selectType %= 4;
                    searchCondition.wheelNum = 0;
                }

                var payload = JSON.stringify(searchCondition);

                var request = $http({
                    method: 'POST',
                    url: API_URL + suffix,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return WarningSearchService.createRecord(response.data.data);
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

            WarningSearchService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data.list, function (elem) {
                    result = result.concat(WarningSearchService.transferResult(elem));
                });
                content.result = result;
                content.pages = data.pages;
                content.pageNum = data.pageNum;
                return content;
            };


            WarningSearchService.transferResult = function (elem) {
                var Record = function () {
                };
                var records = [];
                var record = {};


                record.trainId = elem.trainId;

                record.carriageNum = elem.carriageNum;
                record.wheelNum = elem.wheelNum;

                record.qrValue = elem.qrValue || elem.qrValue === 0 ? elem.qrValue : null;

                //state 0 = null => default black
                record.qrValueState = elem.qrValueState ? elem.qrValueState : null;
                record.zhoucha = elem.zhoucha || elem.zhoucha === 0 ? elem.zhoucha : null;
                record.zhouchaState = elem.zhouchaState ? elem.zhouchaState : null;
                record.jiacha = elem.jiacha || elem.jiacha === 0 ? elem.jiacha : null;
                record.jiachaState = elem.jiachaState ? elem.jiachaState : null;
                record.lunjing = elem.lunjing || elem.lunjing === 0 ? elem.lunjing : null;
                record.lunjingState = elem.lunjingState ? elem.lunjingState : null;
                record.lungao = elem.lungao || elem.lungao === 0 ? elem.lungao : null;
                record.lungaoState = elem.lungaoState ? elem.lungaoState : null;
                record.lunhou = elem.lunhou || elem.lunhou === 0 ? elem.lunhou : null;
                record.lunhouState = elem.lunhouState ? elem.lunhouState : null;
                record.checha = elem.checha || elem.checha === 0 ? elem.checha : null;
                record.chechaState = elem.chechaState ? elem.chechaState : null;
                record.neicejuValue = elem.neicejuValue || elem.neicejuValue === 0 ? elem.neicejuValue : null;

                record.trainDate = elem.trainDate.slice(0, 4) + '-' + elem.trainDate.slice(4, 6) + '-' + elem.trainDate.slice(6, 8) + ' ' +
                    elem.trainDate.slice(8, 10) + ':' + elem.trainDate.slice(10, 12) + ':' + elem.trainDate.slice(12, 14);

                records.push(angular.extend(new Record(), record));
                return records;
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }

            return WarningSearchService;
        }]);
