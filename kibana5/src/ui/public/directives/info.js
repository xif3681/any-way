import html from 'ui/partials/info.html';
import fahtml from 'ui/partials/fa_info.html';
import uiModules from 'ui/modules';

uiModules
  .get('kibana')
  .directive('kbnInfo', function () {
    return {
      restrict: 'E',
      scope: {
        info: '@',
        fainfo: '@',
        placement: '@'
      },
      template: html,
      link: function ($scope) {
        $scope.placement = $scope.placement || 'top';
      }
    };
  })
  .directive('kbnFaInfo', function () {
    return {
      restrict: 'E',
      scope: {
        info: '@',
        fainfo: '@',
        placement: '@'
      },
      template: fahtml,
      link: function ($scope) {
        $scope.placement = $scope.placement || 'top';
      }
    };
  });
