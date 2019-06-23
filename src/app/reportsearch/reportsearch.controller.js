'use strict';

var module = angular.module('supportAdminApp');

module.controller("ReportSearchController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'ReportSearchService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, reportSearchService, $const) {
        $scope.$on('ReportDataUpdated', function (event) {
            $('.footable-report-search').footable({ paginate: false });
            $('.footable-report-search').trigger('footable_redraw');
        });

        $scope.selectedItem = null;
        $scope.inputTrainId = null;
        $scope.querySearch = function (query) {
            return query ? $scope.trainIds.filter(createFilterFor(query)) : $scope.trainIds;
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

        // fixed data 
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds = $const.TRAIN_ID;
        $scope.motorNums = [
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
            { name: '4', value: 4 },
            { name: '全部', value: 0 }

        ];
        $scope.wheelNums = [
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
            { name: '4', value: 4 },
            { name: '5', value: 5 },
            { name: '6', value: 6 },
            { name: '7', value: 7 },
            { name: '8', value: 8 },
            { name: '全部', value: 0 }
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
        $scope.selectType = [
            { name: '振动', value: 1 },
            { name: '轴温', value: 2 },
            { name: '电机', value: 3 }
        ];

        $scope.pageSizes = [
            { name: '8', value: '8' },
            { name: '16', value: '16' },
            { name: '24', value: '24' },
            { name: '40', value: '40' },
            { name: '56', value: '56' },
            { name: '80', value: '80' },
            { name: '160', value: '160' }
        ];

        $scope.selectRadioButton = function (value) {
            $scope.formSearch.selectType = value;
            $scope.formSearch.isLoaded = false;
            if (value === 1 || value === 2) {
                $scope.formSearch.wheelDisabled = false;
                $scope.formSearch.motorDisabled = true;
            } else {
                $scope.formSearch.wheelDisabled = true;
                $scope.formSearch.motorDisabled = false;
            }
        };

        $scope.formSearch = {
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            trainId: null,

            carriageNum: null,
            wheelNum: null,
            wheelDisabled: false,
            motorNum: null,
            motorDisabled: false,

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

            if (!$scope.formSearch.trainId || !$scope.formSearch.carriageNum || !$scope.formSearch.selectType) {
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
            if (($scope.formSearch.selectType === 1 || $scope.formSearch.selectType === 2) && (!$scope.formSearch.wheelNum && $scope.formSearch.wheelNum !== 0)) {
                $alert.error("查询条件有误，请选择车轮号");
                return
            }
            if ($scope.formSearch.selectType === 3 && (!$scope.formSearch.motorNum && $scope.formSearch.motorNum !== 0)) {
                $alert.error("查询条件有误，请选择电机号");
                return
            }
            if (searchCondition.startTime > searchCondition.endTime) {
                $alert.error("起始时间不能大于结束时间");
                return
            }


            searchCondition.trainId = $scope.formSearch.trainId;
            searchCondition.carriageNum = $scope.formSearch.carriageNum;
            searchCondition.selectType = $scope.formSearch.selectType;
            searchCondition.wheelNum = $scope.formSearch.wheelNum;
            searchCondition.motorNum = $scope.formSearch.motorNum;

            searchCondition.page = parseInt($scope.pagination.current);
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);


            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            reportSearchService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) == "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.reportRecords = data.result;

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.pagination.current = data.pageNum;
                    $scope.pagination.totalPages = data.pages;
                    $scope.pages = generatePagesArray($scope.pagination.current, $scope.pagination.totalPages, 9)
                    $scope.$broadcast('ReportDataUpdated');
                },
                function (err) {
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.reportRecords = [];

        //报表下载   $scope.reportRecords
        $scope.exportData = function () {
            var csvString = "线路,站点,车号,安装点,主控端,左齿最小,右齿最小,左齿平均,右齿平均,左槽深最小,右槽深最小,左槽深平均,右槽深平均,最大温度,平均温度,状态,时间" + "\n";

            var raw_table = $scope.reportRecords;
            for (var idx = 0, len = raw_table.length; idx < len; idx++) {
                csvString = csvString + "4," + $scope.station + "," + $scope.formSearch.trainId + "," + $scope.formSearch.trainDirection + ","
                    + $scope.reportRecords[idx].controlNum + "," + $scope.reportRecords[idx].lgapMin + ","
                    + $scope.reportRecords[idx].rgapMin + "," + $scope.reportRecords[idx].lgapAverage + ","
                    + $scope.reportRecords[idx].rgapAverage + "," + $scope.reportRecords[idx].lslotMin + "," + $scope.reportRecords[idx].rslotMin + "," + raw_table[idx].lslotAverage + ","
                    + $scope.reportRecords[idx].rslotAverage + "," + $scope.reportRecords[idx].tempMax + "," + $scope.reportRecords[idx].tempAverage + ","
                    + $scope.reportRecords[idx].trainState + "," + $scope.reportRecords[idx].trainDate + ",";

                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString = csvString.substring(0, csvString.length - 1);
            var a = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: '电机报表.csv'
            }).appendTo('body');
            a[0].click();
            a.remove();
        };

        $scope.pagination = {
            current: 1,
            totalPages: 1,
            pageSize: $scope.pageSizes[1].value
        };
        $scope.setCurrent = function (num) {
            if (num === '...' || num === $scope.pagination.current || num === 0 || num === ($scope.pagination.totalPages + 1)) {
                return
            }
            $scope.pagination.current = num;
            $scope.search();
        };

        $scope.onChange = function () {
            $scope.search();
        };

        // calculate the array of the page
        function generatePagesArray(currentPage, totalPages, paginationRange) {
            var pages = [];
            var halfWay = Math.ceil(paginationRange / 2);
            var position;

            if (currentPage <= halfWay) {
                position = 'start';
            } else if (totalPages - halfWay < currentPage) {
                position = 'end';
            } else {
                position = 'middle';
            }

            var ellipsesNeeded = paginationRange < totalPages;
            var i = 1;
            while (i <= totalPages && i <= paginationRange) {
                var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

                var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
                var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
                if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                    pages.push('...');
                } else {
                    pages.push(pageNumber);
                }
                i++;
            }
            return pages;
        }

        function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
            var halfWay = Math.ceil(paginationRange / 2);
            if (i === paginationRange) {
                return totalPages;
            } else if (i === 1) {
                return i;
            } else if (paginationRange < totalPages) {
                if (totalPages - halfWay < currentPage) {
                    return totalPages - paginationRange + i;
                } else if (halfWay < currentPage) {
                    return currentPage - halfWay + i;
                } else {
                    return i;
                }
            } else {
                return i;
            }
        }

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $('.footable').footable({ paginate: false });
        });
    }]);




// checkbox
// $scope.items = ['报警'];
// $scope.itemsTransfer = [2,6,5,3,7];
// $scope.selected = [];
// $scope.toggle = function (item) {
//     var idx = $scope.selected.indexOf($scope.itemsTransfer[$scope.items.indexOf(item)]);
//     if (idx > -1) {
//         $scope.selected.splice(idx, 1);
//     }
//     else {
//         $scope.selected.push($scope.itemsTransfer[$scope.items.indexOf(item)]);
//     }
// };
// $scope.exists = function (item) {
//     return $scope.selected.indexOf($scope.itemsTransfer[$scope.items.indexOf(item)]) > -1;
// };