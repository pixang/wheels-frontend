'use strict';

var module = angular.module('supportAdminApp');

module.controller("AnalysisSpotController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'AnalysisSpotService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, analysisSpotService, $const) {

        $scope.selectedItem = null;
        $scope.inputTrainId = "001002";
        $scope.querySearch = function (query) {
            if(query === "001002"){
                return $scope.trainIds;
            }else{
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
        $scope.OpenMenu = function(){
            $scope.inputTrainId = null;
        };
        // fixed data 
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds = $const.TRAIN_ID_LONG;

        $scope.formSearch = {
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            trainId: null,

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

        $scope.search = function () {
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

            if (!$scope.formSearch.trainId) {
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
        
            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            analysisSpotService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof(data) === "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    var record = {
                        trainDate: [],
                        zhoucha:[],
                        jiacha:[],
                        checha:[]
                    };
                    var date,dateStr;
                    for(var idx=0,len=data.length; idx < len; idx++) {
                        dateStr = data[idx].trainDate;
                        date = new Date(dateStr.slice(0,4),dateStr.slice(4,6),dateStr.slice(6,8),
                                        dateStr.slice(8,10),dateStr.slice(10,12),dateStr.slice(12,14));
                        
                        record.zhoucha.push([Date.parse(date),data[idx].zhoucha]);
                        record.jiacha.push( [Date.parse(date),data[idx].jiacha]);
                        record.checha.push( [Date.parse(date),data[idx].checha]);
                    }
                    $scope.zwmotor = record;

                    $scope.$broadcast('ChartDataUpdated');
                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function (err) {
                    consoel.log(err);
                    $alert.error("服务器出错", $scope);
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.zwmotor = {};

        $scope.$on('ChartDataUpdated', function(event){
            $timeout(function(){
                $rootScope.$broadcast('ResizePage');
            }, 800);
        });

        $scope.$on('ChartDataUpdated', function(event){
            var zhoucha = new Highcharts.Chart({
                chart: {
                    renderTo: 'zhoucha',
                    type:'scatter',
                    backgroundColor: '#fafafa',
                    zoomType: 'xy',
                    marginRight: 100
                },
                title: {
                    text: '轴差趋势分析图'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        millisecond: '%H:%M:%S.%L',
                        second: '%H:%M:%S',
                        minute: '%H:%M',
                        hour: '%H:%M',
                        day: '%m-%d',
                        week: '%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    }
                },
                tooltip: {
                    formatter: function() {
                        return  '<b>' + this.series.name +'</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%e %H:%M:%S',
                                new Date(this.x))
                            + ', ' + this.y + ' ';
                    }
                },
                yAxis: {
                    title: {
                        text: '轴差'
                    }
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 3,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)'
                                }
                            }
                        },
                        states: {
                            hover: {
                                marker: {
                                    enabled: false
                                }
                            }
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: '轴差',
                    color: 'rgba(223, 83, 83, .5)',
                    data: $scope.zwmotor.zhoucha
                }]
            });
            var jiacha = new Highcharts.Chart({
                chart: {
                    renderTo: 'jiacha',
                    type:'scatter',
                    backgroundColor: '#fafafa',
                    zoomType: 'xy',
                    marginRight: 100
                },
                title: {
                    text: '架差趋势分析图'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        millisecond: '%H:%M:%S.%L',
                        second: '%H:%M:%S',
                        minute: '%H:%M',
                        hour: '%H:%M',
                        day: '%m-%d',
                        week: '%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    }
                },
                tooltip: {
                    formatter: function() {
                        return  '<b>' + this.series.name +'</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%e %H:%M:%S',
                                new Date(this.x))
                            + ', ' + this.y + ' ';
                    }
                },
                yAxis: {
                    title: {
                        text: '架差'
                    }
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 3,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)'
                                }
                            }
                        },
                        states: {
                            hover: {
                                marker: {
                                    enabled: false
                                }
                            }
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: '架差',
                    color: 'rgba(223, 83, 83, .5)',
                    data: $scope.zwmotor.jiacha
                }]
            });
            var checha = new Highcharts.Chart({
                chart: {
                    renderTo: 'checha',
                    type:'scatter',
                    backgroundColor: '#fafafa',
                    zoomType: 'xy',
                    marginRight: 100
                },
                title: {
                    text: '车差趋势分析图'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        millisecond: '%H:%M:%S.%L',
                        second: '%H:%M:%S',
                        minute: '%H:%M',
                        hour: '%H:%M',
                        day: '%m-%d',
                        week: '%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    }
                },
                tooltip: {
                    formatter: function() {
                        return  '<b>' + this.series.name +'</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%e %H:%M:%S',
                                new Date(this.x))
                            + ', ' + this.y + ' ';
                    }
                },
                yAxis: {
                    title: {
                        text: '车差'
                    }
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 3,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)'
                                }
                            }
                        },
                        states: {
                            hover: {
                                marker: {
                                    enabled: false
                                }
                            }
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: '车差',
                    color: 'rgba(223, 83, 83, .5)',
                    data: $scope.zwmotor.checha
                }]
            });
        });

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $rootScope.$broadcast('ResizePage');
        });
    }]);
