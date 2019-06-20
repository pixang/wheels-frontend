'use strict';

var module = angular.module('supportAdminApp');

module.controller("DayDefiniteValueSearchController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'DayDefiniteValueService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, dayDefiniteValueService, $const) {
        // footable
        angular.element(document).ready(function () {
            $('.footable').footable({ paginate: false });
        });

        $scope.$on('ToothTableDataUpdated', function (event) {
            $('.footable').trigger('footable_redraw');
            $timeout(function () {
                $rootScope.$broadcast('ResizePage');
            }, 800);
        });

        // fixed data
        $scope.station = $const.STATION;
        $scope.line = $const.LINE;

        $scope.tooths = $const.GEAR;
        $scope.pageSizes = [
            { name: '8', value: '8' },
            { name: '16', value: '16' },
            { name: '24', value: '24' },
            { name: '40', value: '40' },
            { name: '56', value: '56' },
            { name: '80', value: '80' },
            { name: '160', value: '160' }
        ];

        $scope.formSearch = {
            startTime: new Date(2017, 9, 16, 0, 0, 0),
            toothHeight: "25",

            firstTooth: "3",
            secondTooth: "73",
            isLoaded: false,
            isLoading: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        }
        $scope.dateTransfer = function (date) {
            var Y = date.getFullYear(),
                M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1),
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate()),
                h = date.getHours() < 10 ? '0' + (date.getHours()) : '' + (date.getHours()),
                m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : '' + (date.getMinutes()),
                s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : '' + (date.getSeconds());
            return Y + M + D + h + m + s;
        }

        $scope.search = function () {
            $alert.clear();
            var err = [];
            var searchCondition = {};
            if ($scope.formSearch.startTime) {
                searchCondition.trainDate = $scope.dateTransfer($scope.formSearch.startTime);
            } else {
                err.push("行车时间不能为空");
            }

            if ($scope.formSearch.toothHeight == "" || $scope.formSearch.firstTooth == "" || $scope.formSearch.secondTooth == "") {
                err.push("查询条件有误，请检查");
            }
            if (err.length > 0) {
                $alert.error(err.join('! '))
                return
            }

            searchCondition.gapValue = parseInt($scope.formSearch.toothHeight);
            searchCondition.firstGap = parseInt($scope.formSearch.firstTooth);
            searchCondition.secondGap = parseInt($scope.formSearch.secondTooth);
            searchCondition.page = parseInt($scope.pagination.current);
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);
            $scope.formSearch.setLoading(true);
            dayDefiniteValueService.retrieveTrendencyRecord(searchCondition).then(
                function (data) {
                    $scope.toothRecords = data.result;

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.pagination.current = data.pageNum;
                    $scope.pagination.totalPages = data.pages;
                    $scope.pages = generatePagesArray($scope.pagination.current, $scope.pagination.totalPages, 9)
                    $scope.$broadcast('ToothTableDataUpdated');
                },
                function (err) {
                }
            )
        }

        $scope.toothRecords = [];

        $scope.exportReportData = function () {
            var csvString = "行车时间,线路,车号,站点,安装点,电机号,齿号,左数值,右数值" + "\n";

            var raw_table = $scope.toothRecords;
            for (var idx = 0, len = raw_table.length; idx < len; idx++) {

                csvString = csvString + raw_table[idx].trainDate + "," +  $scope.line + ",\'" + raw_table[idx].trainId + "\'," + $scope.station + ","
                    + raw_table[idx].trainDirection + "," + raw_table[idx].motorNum + ","
                    + raw_table[idx].gearNum + "," + raw_table[idx].lgapValue + ',' + raw_table[idx].rgapValue + ',';

                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString = csvString.substring(0, csvString.length - 1);

            var a = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: "当日过车定值查询分析表.csv"
            }).appendTo('body')
            a[0].click()
            a.remove();
        };

        $scope.pagination = {
            current: 1,
            totalPages: 1,
            pageSize: $scope.pageSizes[1].value,
        }
        $scope.setCurrent = function (num) {
            if (num === '...' || num == $scope.pagination.current || num == 0 || num == ($scope.pagination.totalPages + 1)) {
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
            $rootScope.$broadcast('ResizePage');
        });
    }]);
