'use strict';

angular.module('supportAdminApp')
    .factory('DetailMotorDataService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var DetailMotorDataService = {};

            DetailMotorDataService.retrieveMotorRecord = function (searchCondition) {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/' + searchCondition.trainOnlyid + '/' + 'wheeldetail',
                    headers: {
                        "Content-Type": "application/json"
                    }
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
                        return $q.reject({ error: error });
                    }
                );
            };
            // DetailMotorDataService.createRecord = function(data){
            //     var result = [];
            //     var content = {};
            //     angular.forEach(data, function(elem){
            //         result = result.concat(DetailMotorDataService.transferResult(elem));
            //     });
            //     content.result = result;
            //
            //     return content;
            // };
            // DetailMotorDataService.transferResult = function(elem){
            //     var Record = function() {};
            //     var records = [];
            //     var record = {};
            //
            //     record.carriageNum = elem.carriageNum;
            //     record.wheelNum = elem.wheelNum;
            //     record.lunjing = elem.lunjing;
            //     record.lunjingState = elem.lunjingState;
            //     record.lungao = elem.lungao;
            //     record.lungaoState = elem.lungaoState;
            //     record.lunhou = elem.lunhou;
            //     record.lunhouState = elem.lunhouState;
            //     record.qrValue = elem.qrValue;
            //     record.neicejuValue = elem.neicejuValue;
            //     record.zhoucha = elem.zhoucha;
            //     record.zhouchaState = elem.zhouchaState;
            //     record.jiacha = elem.jiacha;
            //     record.jiachaState = elem.jiachaState;
            //     record.checha = elem.checha;
            //     record.chechaState = elem.chechaState;
            //
            //     records.push(angular.extend(new Record(), record));
            //     return records;
            // // };
            //
            // function fix_number(x) {
            //     return Number.parseFloat(x).toFixed(2);
            // }
            return DetailMotorDataService;
        }]);
