'use strict';

var module = angular.module('supportAdminApp');

module.controller("WarningSearchController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'WarningSearchService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, warningSearchService, $const) {

        $scope.$on('ReportDataUpdated', function (event) {
            var report_search = $('.footable-report-search');
            report_search.footable({ paginate: false });
            report_search.trigger('footable_redraw');
        });

        //radio box
        $scope.selectedItem = null;
        // $scope.inputTrainId    = null;
        $scope.inputTrainId = "全部";
        $scope.querySearch = function (query) {
            if (query === "全部") {
                return $scope.trainIds;
            } else {
                return query ? $scope.trainIds.filter(createFilterFor(query)).concat($scope.trainIds) : $scope.trainIds;
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
        // checkbox
        $scope.items = ['正常', '报警', '预警', '异常'];
        $scope.selected = [1];
        $scope.toggle = function (item) {
            var idx = $scope.selected.indexOf($scope.items.indexOf(item));
            if (idx > -1) {
                $scope.selected.splice(idx, 1);
            }
            else {
                $scope.selected.push($scope.items.indexOf(item));
            }
        };
        $scope.exists = function (item) {
            return $scope.selected.indexOf($scope.items.indexOf(item)) > -1;
        };

        // fixed data 
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds = $const.TRAIN_ID.slice(0);
        $scope.trainIds.unshift("全部");

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

        $scope.selectTypeFirst = [
            { name: '轮径', value: 0 },
            { name: '轮缘厚', value: 2 },
            { name: '轮缘高', value: 1 },
            { name: 'Q/R值', value: 3 }

        ];
        $scope.selectTypeSecond = [
            { name: '内侧距', value: 4 },
            { name: '轴差', value: 5 },
            { name: '架差', value: 6 },
            { name: '车差', value: 7 }
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
            if (value === 4 || value === 5 || value === 6 || value === 7) {
                $scope.formSearch.wheelDisabled = true;
            } else {
                $scope.formSearch.wheelDisabled = false;
            }
        };
        $scope.formSearch = {
            startTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            endTime: new Date(),
            trainId: "全部",

            carriageNum: "all",
            wheelNum: 0,
            wheelDisabled: false,

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
        $scope.selectRadioButton(0);

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

            if (!$scope.formSearch.trainId || !$scope.formSearch.carriageNum || (!$scope.formSearch.selectType && $scope.formSearch.selectType !== 0)) {
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
            if ($scope.formSearch.selectType < 4 && (!$scope.formSearch.wheelNum && $scope.formSearch.wheelNum !== 0)) {
                $alert.error("查询条件有误，请选择车轮号");
                return
            }

            if (searchCondition.startTime > searchCondition.endTime) {
                $alert.error("起始时间不能大于结束时间");
                return
            }
            if ($scope.formSearch.trainId === "全部") {
                searchCondition.trainId = 0;
            } else {
                searchCondition.trainId = $scope.formSearch.trainId;
            }
            searchCondition.carriageNum = $scope.formSearch.carriageNum;
            searchCondition.selectType = $scope.formSearch.selectType;
            searchCondition.wheelNum = $scope.formSearch.wheelNum;
            searchCondition.trainStatus = $scope.selected.length !== 0 ? $scope.selected : [0, 1, 2, 3];

            searchCondition.page = parseInt($scope.pagination.current);
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);

            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            warningSearchService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) === "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.detailRecords = data.result;
                    $scope.reportRecords = [];

                    if ($scope.formSearch.selectType > 3) {
                        var record = [];
                        for (var idx = 0, length = $scope.detailRecords.length; idx < length; idx++) {
                            if (idx % 2 !== 0) {
                                $scope.detailRecords[idx].neicejuValue = '';
                                $scope.detailRecords[idx].zhoucha = '';
                            }
                            if (idx % 4 !== 0) {
                                $scope.detailRecords[idx].jiacha = '';
                            }
                            if (idx % 8 !== 0) {
                                $scope.detailRecords[idx].checha = '';
                            }
                            record.push($scope.detailRecords[idx]);
                            if ((idx + 1) % 8 === 0) {
                                $scope.reportRecords.push(record);
                                record = [];
                            }
                        }
                    } else {
                        $scope.reportRecords = data.result;
                    }

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
        $scope.detailRecords = [];

        //报表下载   $scope.reportRecords
        $scope.exportData = function () {
            var csvString, raw_table, idx, len;
            switch ($scope.formSearch.selectType) {
                case 0:
                    csvString = "线路,车号,车厢号,车轮号,轮径,时间" + "\n";
                    raw_table = $scope.reportRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].lunjing + "," + raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
                case 1:
                    csvString = "线路,车号,车厢号,车轮号,轮缘高,时间" + "\n";
                    raw_table = $scope.reportRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].lungao + "," +
                            raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
                case 2:
                    csvString = "线路,车号,车厢号,车轮号,轮缘厚,时间" + "\n";
                    raw_table = $scope.reportRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].lunhou + "," +
                            raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
                case 3:
                    csvString = "线路,车号,车厢号,车轮号,Q/R值,时间" + "\n";
                    raw_table = $scope.reportRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].qrValue + "," +
                            raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
                case 4:
                    csvString = "线路,车号,车厢号,车轮号,内侧距,时间" + "\n";
                    raw_table = $scope.detailRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].neicejuValue + "," +
                            raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
                case 5:
                    csvString = "线路,车号,车厢号,车轮号,内侧距,轴差,时间" + "\n";
                    raw_table = $scope.detailRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].neicejuValue + "," + raw_table[idx].zhoucha + ","
                            + raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
                case 6:
                    csvString = "线路,车号,车厢号,车轮号,内侧距,轴差,架差,时间" + "\n";
                    raw_table = $scope.detailRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].neicejuValue + "," + raw_table[idx].zhoucha + ","
                            + raw_table[idx].jiacha + "," + raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
                case 7:
                    csvString = "线路,车号,车厢号,车轮号,内侧距,轴差,架差,车差,时间" + "\n";
                    raw_table = $scope.detailRecords;
                    for (idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + $scope.formSearch.trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].neicejuValue + "," + raw_table[idx].zhoucha + ","
                            + raw_table[idx].jiacha + "," + raw_table[idx].checha + "," + raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    break;
            }
            csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var a = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: '历史查询报表.csv'
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

        $scope.dateTransfer = function (date) {
            var Y = date.getFullYear(),
                M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1),
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate()),
                h = date.getHours() < 10 ? '0' + (date.getHours()) : '' + (date.getHours()),
                m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : '' + (date.getMinutes()),
                s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : '' + (date.getSeconds());
            return Y + M + D + h + m + s;
        };

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $('.footable').footable({ paginate: false });
            $scope.search();
        });
    }]);
