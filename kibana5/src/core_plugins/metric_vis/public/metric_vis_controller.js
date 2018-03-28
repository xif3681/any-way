import _ from 'lodash';
import moment from 'moment';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import uiModules from 'ui/modules';
// get the kibana/metric_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/metric_vis', ['kibana']);

module.controller('KbnMetricVisController', function ($scope, $rootScope, $window, Private) {
  if ($scope.vis.params.ratios) {
    $rootScope.ratiosMetric = true;
  } else {
    $rootScope.ratiosMetric = false;
  }

  const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);

  const metrics = $scope.metrics = [];

  function isInvalid(val) {
    if (val === 'NaN') {
      val = NaN;
    }
    return _.isUndefined(val) || _.isNull(val) || _.isNaN(val);
  }

  $scope.processTableGroups = function (tableGroups) {
    tableGroups.tables.forEach(function (table) {
      table.columns.forEach(function (column, i) {
        const fieldFormatter = table.aggConfig(column).fieldFormatter();
        let value = table.rows[0][i];
        if ($scope.vis.params.ratios) {
          value.data = isInvalid(value.data) ? '?' : fieldFormatter(value.data);
          if (value.data === '?') {
            metrics.push({
              label: column.title,
              value: value.data,
              ratios: value.ratios,
              flag: false
            });
          } else {
            metrics.push({
              label: column.title,
              value: value.data,
              ratios: value.ratios,
              flag: true
            });
          }

        } else {
          value = isInvalid(value) ? '?' : fieldFormatter(value);
          metrics.push({
            label: column.title,
            value: value
          });
        }
      });
    });
  };
  // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
  Date.prototype.Format = function (fmt) {
    let o = {
      'y+': this.getFullYear(), //年份
      'M+': this.getMonth() + 1, //月份
      'd+': this.getDate(), //日
      'h+': this.getHours(), //小时
      'm+': this.getMinutes(), //分
      's+': this.getSeconds(), //秒
      'q+': Math.floor((this.getMonth() + 3) / 3), //季度
      'S': this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
  };
  $scope.$watch('esResponse', function (resp) {
    if (resp) {
      //获取时间，保存在$rootScope.metricTimeRange，在发msearch的时候保存的
      let lastStartTime = $rootScope.metricTimeRange.start - ($rootScope.metricTimeRange.stop - $rootScope.metricTimeRange.start);
      $scope.lastStartTime = (new Date(lastStartTime)).Format('yyyy-MM-dd hh:mm:ss');
      let lastEndTime = $rootScope.metricTimeRange.start;
      $scope.lastEndTime = (new Date(lastEndTime)).Format('yyyy-MM-dd hh:mm:ss');
      let nowEndTime = $rootScope.metricTimeRange.stop;
      $scope.nowEndTime = (new Date(nowEndTime)).Format('yyyy-MM-dd hh:mm:ss');
      metrics.length = 0;
      $scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
    }
  });
  $scope.$on('$destroy', function () {
    $rootScope.ratiosMetric = false;
  });
})
  .controller('KbnMetricRatiosController', function ($scope, $rootScope) {
    // $rootScope.ratiosMetric = true;
    $scope.ratiosChange = function () {
      if ($scope.vis.params.ratios) {
        $scope.vis.params.ratios = false;
        $rootScope.ratiosMetric = false;
      } else {
        $rootScope.ratiosMetric = true;
        $scope.vis.params.ratios = true;
      }
    };
    $scope.$on('$destroy', function () {
      $rootScope.ratiosMetric = false;
    });
  });
