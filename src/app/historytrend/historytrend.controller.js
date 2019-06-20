'use strict';

var module = angular.module('supportAdminApp');

module.controller("HistoryTrendController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'HistoryTrendService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, historyTrendService, $const) {
        $scope.selectedItem = null;
        $scope.inputTrainId = "001002";
        $scope.querySearch = function (query) {
            if (query === "001002") {
                return $scope.trainIds;
            } else {
                return query ? $scope.trainIds.filter(createFilterFor(query)) : $scope.trainIds;
            }
        };
        $scope.selectedTrainIdChange = function (trainId) {
            $scope.formSearch.trainId = trainId;
        };
        $scope.searchInputChange = function (trainId) {
            $scope.formSearch.trainId = trainId;
        };

        function createFilterFor(query) {
            return function filterFn(trainIds) {
                return (trainIds.indexOf(query) === 0);
            };
        }
        $scope.OpenMenu = function () {
            $scope.inputTrainId = null;
        };
        // fixed data 
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds = $const.TRAIN_ID;

        $scope.wheelNums = [
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
            { name: '4', value: 4 },
            { name: '5', value: 5 },
            { name: '6', value: 6 },
            { name: '7', value: 7 },
            { name: '8', value: 8 },
        ];
        $scope.carriageNums = [
            { name: 'IA', value: 'IA' },
            { name: 'IB', value: 'IB' },
            { name: 'IC', value: 'IC' },
            { name: 'ID', value: 'ID' },
            { name: 'IID', value: 'IID' },
            { name: 'IIC', value: 'IIC' },
            { name: 'IIB', value: 'IIB' },
            { name: 'IIA', value: 'IIA' },
            { name: '全部', value: 'all' }
        ];
        $scope.tableDic = [
            { id: 'lungao', title: '轮缘高', value: 'lungao' },
            { id: 'lunhou', title: '轮缘厚', value: 'lunhou' },
            { id: 'lunjing', title: '轮径', value: 'lunjing' },
            { id: 'qrvalue', title: 'qr值', value: 'qrValue' },
            { id: 'neiceju', title: '内侧距', value: 'neicejuValue' },
            { id: 'checha', title: '车差', value: 'checha' },
            { id: 'jiacha', title: '架差', value: 'jiacha' },
            { id: 'zhoucha', title: '轴差', value: 'zhoucha' }
        ];

        $scope.formSearch = {
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            trainId: null,

            carriageNum: null,
            wheelNum: null,
            selectType: null,
            isLoaded: false,
            isLoading: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };
        $scope.dateTransfer = function (date) {
            var Y = date.getFullYear(),
                M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1),
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate()),
                h = date.getHours() < 10 ? '0' + (date.getHours()) : '' + (date.getHours()),
                m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : '' + (date.getMinutes()),
                s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : '' + (date.getSeconds());
            return Y + M + D + h + m + s;
        };

        $scope.search = function (selectType) {
            $alert.clear();
            var err = [];
            var searchCondition = {};
            if ($scope.formSearch.startTime) {
                searchCondition.startTime = $scope.dateTransfer($scope.formSearch.startTime);
            } else {
                err.push("起始时间不能为空");
            }
            if ($scope.formSearch.endTime) {
                searchCondition.endTime = $scope.dateTransfer($scope.formSearch.endTime);
            } else {
                err.push("结束时间不能为空");
            }

            if (!$scope.formSearch.trainId || !$scope.formSearch.carriageNum || !$scope.formSearch.wheelNum) {
                err.push("查询条件有误，请检查");
            }
            if (err.length > 0) {
                $alert.error(err.join('! '));
                return
            }
            if ($scope.trainIds.indexOf($scope.formSearch.trainId) === -1) {
                $alert.error("不存在该车号，请检查");
                return
            }

            if (searchCondition.startTime > searchCondition.endTime) {
                $alert.error("起始时间不能大于结束时间");
                return
            }

            searchCondition.trainId = $scope.formSearch.trainId;
            searchCondition.carriageNum = $scope.formSearch.carriageNum;
            searchCondition.wheelNum = $scope.formSearch.wheelNum;

            $scope.formSearch.selectType = selectType;

            searchCondition.selectType = selectType;

            $scope.formSearch.setLoading(true);
            // historyTrendService.retrieveRecord(searchCondition).then(
            //     function (data) {
            //         if (typeof(data) === "string") {
            //             $alert.error(data);
            //             $scope.formSearch.setLoading(false);
            //             return
            //         }
            //         var record = {
            //             trainDate: [],
            //             neiceju: [],
            //             zhoucha:[],
            //             jiacha:[],
            //             checha:[]
            //         };
            //         var date;
            //         for(var idx=0,len=data.length; idx < len; idx++) {
            //             date = data[idx].trainDate;
            //             record.trainDate.push( date.slice(0,4)+'-'+date.slice(4,6)+'-'+date.slice(6,8)+ ' '+
            //                                date.slice(8,10)+ ':' + date.slice(10,12)+':'+date.slice(12,14));
            //             record.neiceju.push(data[idx].neicejuValue);
            //             record.zhoucha.push(data[idx].zhoucha);
            //             record.jiacha.push(data[idx].jiacha);
            //             record.checha.push(data[idx].checha);
            //         }
            //         $scope.zwmotor = record;
            //
            //         $scope.$broadcast('ChartDataUpdated');
            //         $scope.formSearch.setLoaded(true);
            //         $scope.formSearch.setLoading(false);
            //     },
            //     function (err) {
            //         consoel.log(err);
            //         $alert.error("服务器出错", $scope);
            //         $scope.formSearch.setLoading(false);
            //     }
            // )
            historyTrendService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) === "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.historyData = {
                        trainDate: [],
                        data: []
                    };
                    for (var idx = 0, len = data.length; idx < len; idx++) {
                        $scope.historyData.trainDate.push(data[idx].trainDate.slice(0, 4) + '-' + data[idx].trainDate.slice(4, 6) + '-' + data[idx].trainDate.slice(6, 8) + ' ' +
                            data[idx].trainDate.slice(8, 10) + ':' + data[idx].trainDate.slice(10, 12) + ':' + data[idx].trainDate.slice(12, 14));
                        $scope.historyData.data.push(data[idx][$scope.tableDic[$scope.formSearch.selectType - 1].value])
                    }

                    $scope.$broadcast('ChartDataUpdated');
                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function (err) {
                    $alert.error("服务器出错", $scope);
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.historyData = {};

        $scope.$on('ChartDataUpdated', function (event) {
            $timeout(function () {
                $rootScope.$broadcast('ResizePage');
            }, 100);
        });

        $scope.$on('ChartDataUpdated', function (event) {
            var neiceju = new Highcharts.Chart({
                chart: {
                    renderTo: $scope.tableDic[$scope.formSearch.selectType - 1].id,
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: $scope.tableDic[$scope.formSearch.selectType - 1].title + '趋势分析图'
                },
                xAxis: {
                    categories: $scope.historyData.trainDate
                },
                yAxis: {
                    title: {
                        text: $scope.tableDic[$scope.formSearch.selectType - 1].title
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                series: [
                    {
                        name: $scope.tableDic[$scope.formSearch.selectType - 1].title,
                        data: $scope.historyData.data
                    }
                ]
            });
        });

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $rootScope.$broadcast('ResizePage');
        });
    }]);
