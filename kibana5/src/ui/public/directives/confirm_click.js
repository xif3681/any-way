import uiModules from 'ui/modules';
uiModules
.get('kibana')
.directive('confirmClick', function ($translate) {
  return {
    restrict: 'A',
    link: function ($scope, $elem, attrs) {
      $elem.bind('click', function () {
        // let message = attrs.confirmation || $translate.instant('Are you sure?');
        let message = null;
        if(attrs.confirmation == undefined){
          message = $translate.instant("Are you sure?");
        }else {
          message = attrs.confirmation
        }
        if (window.confirm(message)) { // eslint-disable-line no-alert
          let action = attrs.confirmClick;
          if (action) {
            $scope.$apply($scope.$eval(action));
          }
        }
      });

      $scope.$on('$destroy', function () {
        $elem.unbind('click');
      });
    },
  };
});
