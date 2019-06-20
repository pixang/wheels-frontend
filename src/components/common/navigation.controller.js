'use strict';

angular.module('supportAdminApp')
  .controller('NavController', ['$scope', '$rootScope','$state', '$cookies',
  function ($scope, $rootScope, $state,$cookies) {
    $scope.$state = $state;
    $scope.userrole = $cookies.get('currentUserRole');
    $scope.forceStateProjects = function () {
      $state.go('index.projects');
    };

    angular.element(document).ready(function() {
      $rootScope.$broadcast('ResizePage');
    });
}]);
