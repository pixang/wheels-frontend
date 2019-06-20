'use strict';

var module = angular.module('supportAdminApp');

module.controller('DetailMotorDataController', [
    '$log', '$scope', '$rootScope', '$stateParams', '$timeout', '$state', '$uibModal', 'Alert', 'DetailMotorDataService', 'constants',
    function ($log, $scope, $rootScope, $stateParams, $timeout, $state, $modal, $alert, detailMotorDataService, $const) {
        $scope.hideDetailMotorData = false;
        $scope.showMotorWave = false;
        $scope.showMotorTable = false;
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.$on('DetailMotorDataUpdated', function (event) {
            var detail_table = $('.footable');
            detail_table.footable({ paginate: false });
            detail_table.trigger('footable_redraw');
            $timeout(function () {
                $rootScope.$broadcast('ResizePage');
            }, 800);
        });

        $scope.$on("ShowDashboard", function () {
                $scope.hideDetailMotorData = true;
            });

        $scope.$on("HideDashboard",
            function () {
                $scope.hideDetailMotorData = false;
            });

        $scope.$on("ShowDetailMotorData",
            function (event, msg) {
                $scope.hideDetailMotorData = false;
                $scope.showMotorWave = false;
                $scope.showMotorTable = false;
                $timeout(function () {
                    $rootScope.$broadcast('ResizePage');
                }, 100);
            });

        $scope.backFromDetailMotorPage = function () {
            $timeout(function () {
                $state.go("index.main");
            }, 200);
        };

        $scope.formSearch = {
            motorNum: '',
            isLoaded: false,
            isLoading: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        $scope.trainDate = $stateParams.trainDate;
        $scope.trainId = $stateParams.trainId;
        $scope.trainDirection = $stateParams.trainDirection === 0 ? '转3回厂' : '下行';
        $scope.trainState = $stateParams.trainState;

        $scope.search = function (trainOnlyId, trainDirection) {
            $alert.clear();
            if (trainOnlyId == null) {
                $alert.error("数据已丢失，请从主页面重新选择！");
                return
            }
            var searchCondition = {};
            searchCondition.trainOnlyid = trainOnlyId;
            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);

            //获取电机温度详细数据    获取振动轴温详细数据
            detailMotorDataService.retrieveMotorRecord(searchCondition).then(
                function (data) {
                    $scope.detailRecords = data;

                    var record = [];
                    for (var idx = 0, length = data.length; idx < length; idx++) {
                        if (idx % 2 !== 0) {
                            data[idx].neicejuValue = '';
                            data[idx].zhoucha = '';
                        }
                        if (idx % 4 !== 0) {
                            data[idx].jiacha = '';
                        }
                        if (idx % 8 !== 0) {
                            data[idx].checha = '';
                        }
                        record.push(data[idx]);
                        if ((idx + 1) % 8 === 0) {
                            $scope.detailMotorRecords.push(record);
                            record = [];
                        }
                    }
                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                    $scope.$broadcast('DetailMotorDataUpdated');
                },
                function (err) {
                }
            );
        };
        $scope.detailMotorRecords = [];
        $scope.detailRecords = [];
        $scope.exportMotorRecords = function () {
            var csvString = "线路,车号,车厢号,轮号,轮径,轮缘厚,轮缘高,Q/R值,内侧距,轴差,架差,车差,状态,行车时间" + "\n";
            var raw_table = $scope.detailRecords;
            for (var idx = 0, len = raw_table.length; idx < len; idx++) {
                csvString = csvString + $scope.line + "," + "\'" + $scope.trainId + "\'" + "," + raw_table[idx].carriageNum + "," + raw_table[idx].wheelNum + ","
                    + raw_table[idx].lunjing + "," + raw_table[idx].lunhou + "," + raw_table[idx].lungao + ","
                    + raw_table[idx].qrValue + "," + raw_table[idx].neicejuValue + "," + raw_table[idx].zhoucha + ","
                    + raw_table[idx].jiacha + "," + raw_table[idx].checha + "," + $scope.trainState + "," + $scope.trainDate + ",";
                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var a = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: '数据报表.csv'
            }).appendTo('body');
            a[0].click();
            a.remove();
        };

        //删除部分代码,其它要修改
        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $timeout(function () {
                $scope.search($stateParams.trainOnlyId, $stateParams.trainDirection);
            }, 300);
        });
    }
]);
