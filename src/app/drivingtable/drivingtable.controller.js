'use strict';

var module = angular.module('supportAdminApp');

module.controller("DrivingTableController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'DrivingTableService', 'DetailMotorDataService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, drivingTableService, detailMotorDataService, $const) {
        $scope.showReportSearch = true;
        $scope.hideDetailMotorData = true;
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.$on('ReportDataUpdated', function (event) {
            var driving_table = $('.footable-driving-table');
            driving_table.footable({ paginate: false });
            driving_table.trigger('footable_redraw');
            $timeout(function () {
                $rootScope.$broadcast('ResizePage');
            }, 800);
        });

        $scope.$on("ShowReportSearch",
            function (event, msg) {
                $scope.showReportSearch = true;
                $scope.hideDetailMotorData = true;
                $timeout(function () {
                    $rootScope.$broadcast('ResizePage');
                }, 800);
            });

        $scope.$on('DetailWheelDataUpdated', function (event) {
            var wheel_table = $('.footable-wheel-table');
            wheel_table.footable({ paginate: false });
            wheel_table.trigger('footable_redraw');
            $timeout(function () {
                $rootScope.$broadcast('ResizePage');
            }, 800);
        });

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
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate());
            return Y + M + D + '000000';
        };

        $scope.search = function () {
            $alert.clear();
            var err = [];
            var searchCondition = {};
            // 取消注释
            var currentTime = new Date(2018, 3, 11);
            searchCondition.pre = $scope.dateTransfer(currentTime);

            searchCondition.page = parseInt($scope.pagination.current);
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);


            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            drivingTableService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) === "string") {
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

        $scope.searchDetail = function (trainOnlyId) {
            $alert.clear();

            if (trainOnlyId == null) {
                $alert.error("数据已丢失，请返回重新选择！");
                return
            }
            var searchCondition = {};
            searchCondition.trainOnlyid = trainOnlyId;


            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);

            detailMotorDataService.retrieveMotorRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) === "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
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
                            $scope.detailVibrateRecords.push(record);
                            record = [];
                        }
                    }

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.$broadcast('DetailWheelDataUpdated');
                },
                function (err) {
                    $scope.formSearch.setLoading(false);
                }
            );
        };
        $scope.detailVibrateRecords = [];
        $scope.detailRecords = [];

        $scope.confirm = function (trainOnlyId, trainId, trainDate, trainState_str) {
            $scope.showReportSearch = false;
            $scope.hideDetailMotorData = false;

            $scope.trainOnlyId = trainOnlyId;
            $scope.trainId = trainId;
            $scope.trainDate = trainDate;
            $scope.trainState = trainState_str;

            $scope.searchDetail(trainOnlyId);
        };

        $scope.backFromDetailMotorPage = function () {
            $rootScope.$broadcast("ShowReportSearch", "wusuowei");
        };

        $scope.exportRecords = function () {
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

        $scope.pagination = {
            current: 1,
            totalPages: 1,
            pageSize: $scope.pageSizes[1].value,
        };
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
            $('.footable').footable({ paginate: false });
            $scope.search();
            $rootScope.$broadcast('ResizePage');
        });
    }]);
