import _ from 'lodash';
import uiModules from 'ui/modules';
import tableVisParamsTemplate from 'plugins/table_vis/table_vis_params.html';

uiModules.get('kibana/table_vis')
.directive('tableVisParams', function (T,$translate, $translatePartialLoader) {

  $translatePartialLoader.addPart('../plugins/kibana/visualize');
  $translate.refresh();
  let lang = $translate.use();
  let totalAggregations;
  if (lang === 'zh-cn') {
    totalAggregations = [
      {
        value:'总和',
        enValue:'sum'
      },
      {
        value:'平均值',
        enValue:'avg'
      },
      {
        value:'最小值',
        enValue:'min'
      },
      {
        value:'最大值',
        enValue:'max'
      },
      {
        value:'计数',
        enValue:'count'
      },
    ];
  } else if (lang === 'zh-tw') {
    totalAggregations = [
      {
        value:'总和',
        enValue:'sum'
      },
      {
        value:'平均值',
        enValue:'avg'
      },
      {
        value:'最小值',
        enValue:'min'
      },
      {
        value:'最大值',
        enValue:'max'
      },
      {
        value:'计数',
        enValue:'count'
      },
    ];
  } else {
    totalAggregations = [
      {
        value:'sum',
        enValue:'sum'
      },
      {
        value:'avg',
        enValue:'avg'
      },
      {
        value:'min',
        enValue:'min'
      },
      {
        value:'max',
        enValue:'max'
      },
      {
        value:'count',
        enValue:'count'
      },
    ];
  }
  return {
    restrict: 'E',
    template: tableVisParamsTemplate,
    link: function ($scope) {
      //$scope.totalAggregations = [T.t('sum'), T.t('avg'), T.t('min'), T.t('max'), T.t('count')];
      $scope.totalAggregations = totalAggregations;
      $scope.$watchMulti([
        'vis.params.showPartialRows',
        'vis.params.showMeticsAtAllLevels'
      ], function () {
        if (!$scope.vis) return;

        const params = $scope.vis.params;
        if (params.showPartialRows || params.showMeticsAtAllLevels) {
          $scope.metricsAtAllLevels = true;
        } else {
          $scope.metricsAtAllLevels = false;
        }
      });
    }
  };
});
