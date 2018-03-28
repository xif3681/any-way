define(function (require) {
  require('plugins/timelion/directives/chart/chart');
  require('plugins/timelion/directives/interval/interval');
  require('plugins/timelion/directives/refresh_hack');
  require('ui/state_management/app_state');

  var _ = require('lodash');
  var module = require('ui/modules').get('kibana/timelion_vis', ['kibana']);
  module.controller('TimelionVisController', function ($scope, Private, Notifier, $http, $rootScope, timefilter, getAppState,
    $translate,$translatePartialLoader) {
    //luo.chunxiang@eisoo.com
    $translatePartialLoader.addPart('../plugins/timelion');
    $translate.refresh();
    var queryFilter = Private(require('ui/filter_bar/query_filter'));
    var timezone = Private(require('plugins/timelion/services/timezone'))();
    var dashboardContext = Private(require('plugins/timelion/services/dashboard_context'));

    var notify = new Notifier({
      location: $translate.instant('Timelion')
    });

    var changeVaule = function (value) {
      var trueValue = value;
      switch (value) {
        case '自动':
        case '自動':
          trueValue = 'auto';
          break;
        case '1秒钟':
        case '1秒鐘':
          trueValue = '1s';
          break;
        case '1分钟':
        case '1分鐘':
          trueValue = '1m';
          break;
        case '1小时':
        case '1小時':
          trueValue = '1h';
          break;
        case '1天':
          trueValue = '1d';
          break;
        case '1周':
          trueValue = '1w';
          break;
        case '1月':
          trueValue = '1M';
          break;
        case '1年':
          trueValue = '1y';
          break;
        case '其他':
          trueValue = 'other';
          break;
        default:
          break;
      };
      return trueValue;
    };

    $scope.search = function run() {
      var expression = $scope.vis.params.expression;
      if (!expression) return;

      $http.post('../api/timelion/run', {
        sheet: [expression],
        extended: {
          es: {
            filter: dashboardContext()
          }
        },
        time: _.extend(timefilter.time, {
          interval: changeVaule($scope.vis.params.interval),
          timezone: timezone
        }),
      })
      // data, status, headers, config
      .success(function (resp) {
        $scope.sheet = resp.sheet;
      })
      .error(function (resp) {
        $scope.sheet = [];
        if (resp.message.indexOf('Max buckets exceeded')) {
          var arr = resp.message.split(' ');
          var num1 = arr[4];
          var num2 = arr[6];
          var err1 = $translate.instant('Max buckets exceeded:') + num1 + $translate.instant('of') + num2
           + $translate.instant('allowed.') + $translate.instant('Choose a larger interval or a shorter time span');
          //let err = new Error(err1);
          //err.stack = resp.stack;
          // var err = err1.toString();
          notify.error(err1);
          //notify.error(`${$translate.instant('Max buckets exceeded:')}${num1}${$translate.instant('of')}${num2}${$translate.instant('allowed.')}${$translate.instant('Choose a larger interval or a shorter time span')}`);
        } else {
          let err = new Error(resp.message);
          err.stack = resp.stack;

          notify.error(err);
        }
        // var err = new Error(resp.message);
        // err.stack = resp.stack;
        // notify.error(err);
      });
    };

    // This is bad, there should be a single event that triggers a refresh of data.

    // When the expression updates
    $scope.$watchMulti(['vis.params.expression', 'vis.params.interval'], $scope.search);

    // When the time filter changes
    $scope.$listen(timefilter, 'fetch', $scope.search);

    // When a filter is added to the filter bar?
    $scope.$listen(queryFilter, 'fetch', $scope.search);

    // When auto refresh happens
    $scope.$on('courier:searchRefresh', $scope.search);

    $scope.$on('fetch', $scope.search);

  });
});
