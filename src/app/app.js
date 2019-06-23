'use strict';

/**
 * 管理系统
 */
angular.module('supportAdminApp', [
    'ngMaterial',
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngResource',
    'ui.router',
    'ui.bootstrap',
    'angular-clipboard',
    'ng-file-model',
    'btorfs.multiselect',
    'ui.bootstrap.datetimepicker',
    'angularMoment',
    'angular-jwt',
    "ngAria",
    "ngMessages",
    "mdPickers"])
    // In the run phase of your Angular application
    .run(
        function run($rootScope, $location, $cookies, $timeout, $http, AuthService) {

            $rootScope.$on('$locationChangeStart', function (event, next, current) {
                var restrictedPage = $.inArray($location.path(), ['/auth']) === -1;
                var loggedIn = $cookies.get('currentUser');

                if (restrictedPage && !loggedIn) {
                    $location.path('/auth');
                    $timeout(function () {
                        $rootScope.$broadcast("ResizeAuthPage", "fromlocation");
                    }, 500);
                } else if ($location.path() == '/index/main') {
                    $rootScope.$broadcast("ShowDashboard", "login state failed");
                }
            });
        }
    )
    // init AuthService, it has to be done once, when app starts

    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('auth', {
                url: '/auth',
                templateUrl: 'app/auth/auth.html',
                controller: 'LoginController',
                data: { pageTitle: 'LoginController' },
            })

            .state('index', {
                abstract: true,
                url: '/index',
                templateUrl: 'components/common/content.html'
            })
            .state('index.main', {
                url: '/main',
                templateUrl: 'app/main/blank.html',
                data: { pageTitle: 'Dashboard' },
            })
            .state('index.detailmotordata', {
                url: '/detailmotordata',
                templateUrl: 'app/detail_motor_data/detailmotordata.html',
                controller: 'DetailMotorDataController',
                params: {
                    trainOnlyId: null,
                    trainId: null,
                    trainDirection: null,
                    trainDate: null,
                    trainState: null
                },
                data: { pageTitle: 'DetailMotorDataController' },
            })
            .state('index.reportsearch', {
                url: '/reportsearch',
                templateUrl: 'app/reportsearch/reportsearch.html',
                controller: 'ReportSearchController',
                data: { pageTitle: 'ReportSearchController' }
            })
            .state('index.warningsearch', {
                url: '/warningsearch',
                templateUrl: 'app/warningsearch/warningsearch.html',
                controller: 'WarningSearchController',
                data: { pageTitle: 'WarningSearchController' }
            })
            .state('index.historytrend', {
                url: '/historytrend',
                templateUrl: 'app/historytrend/historytrend.html',
                controller: 'HistoryTrendController',
                data: { pageTitle: 'HistoryTrendController' }
            })
            .state('index.analysisspot', {
                url: '/analysisspot',
                templateUrl: 'app/analysisspot/analysisspot.html',
                controller: 'AnalysisSpotController',
                data: { pageTitle: 'AnalysisSpotController' }
            })

            .state('index.drivingtable', {
                url: '/drivingtable',
                templateUrl: 'app/drivingtable/drivingtable.html',
                controller: 'DrivingTableController',
                data: { pageTitle: 'DrivingTableController' }
            })

            .state('index.systemconfiguration', {
                url: '/systemconfiguration',
                templateUrl: 'app/system_configuration/system_configuration.html',
                controller: 'SystemConfiguration',
                data: { pageTitle: 'SystemConfiguration' }
            })
            .state('index.systemconfigurationflag', {
                url: '/systemconfigurationflag',
                templateUrl: 'app/system_configuration/system_configuration_flag.html',
                controller: 'SystemConfiguration',
                data: { pageTitle: 'SystemConfiguration' }
            })
            .state('index.usermanage', {
                url: '/usermanage',
                templateUrl: 'app/user_manage/user_manage.html',
                controller: 'UserMangae',
                data: { pageTitle: 'UserMangae' }
            });

        $urlRouterProvider.otherwise('/index/main');
        // $locationProvider.html5Mode(true).hashPrefix('!');
    });
