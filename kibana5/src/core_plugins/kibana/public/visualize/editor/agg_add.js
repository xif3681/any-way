import VisAggConfigProvider from 'ui/vis/agg_config';
import uiModules from 'ui/modules';
import aggAddTemplate from 'plugins/kibana/visualize/editor/agg_add.html';

uiModules
  .get('kibana')
  .directive('visEditorAggAdd', function (Private,aggIndex) {
    const AggConfig = Private(VisAggConfigProvider);

    return {
      restrict: 'E',
      template: aggAddTemplate,
      controllerAs: 'add',
      controller: function ($scope) {
        const self = this;

        self.form = false;
        self.submit = function (schema) {
          self.form = false;

          const aggConfig = new AggConfig($scope.vis, {
            schema: schema
          });
          aggConfig.brandNew = true;
          aggIndex.add = true;//状态监控，标记为新加
          $scope.vis.aggs.push(aggConfig);
        };
      }
    };
  });

