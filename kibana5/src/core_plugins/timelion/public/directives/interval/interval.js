var _ = require('lodash');
var $ = require('jquery');
var moment = require('moment');

var app = require('ui/modules').get('apps/timelion', []);
var html = require('./interval.html');

app.directive('timelionInterval', function ($compile, $timeout, timefilter, $translate, $translatePartialLoader, T) {

  //luo.chunxiang@eisoo.com
  $translatePartialLoader.addPart('../plugins/timelion');
  $translate.refresh();
  var changeVauleEn = function (value) {
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
  var changeVauleCn = function (value) {
    var trueValue = value;
    switch (value) {
      case 'auto':
      case '自動':
        trueValue = '自动';
        break;
      case '1s':
      case '1秒鐘':
        trueValue = '1秒钟';
        break;
      case '1m':
      case '1分鐘':
        trueValue = '1分钟';
        break;
      case '1h':
      case '1小時':
        trueValue = '1小时';
        break;
      case '1天':
      case '1d':
        trueValue = '1天';
        break;
      case '1周':
      case '1w':
        trueValue = '1周';
        break;
      case '1月':
      case '1M':
        trueValue = '1月';
        break;
      case '1年':
      case '1y':
        trueValue = '1年';
        break;
      case '其他':
      case 'other':
        trueValue = '其他';
        break;
      default:
        break;
    };
    return trueValue;
  };
  var changeVauleTw = function (value) {
    var trueValue = value;
    switch (value) {
      case 'auto':
      case '自动':
        trueValue = '自動';
        break;
      case '1s':
      case '1秒钟':
        trueValue = '1秒鐘';
        break;
      case '1m':
      case '1分钟':
        trueValue = '1分钟';
        trueValue = '1分鐘';
        break;
      case '1h':
      case '1小时':
        trueValue = '1小時';
        break;
      case '1天':
      case '1d':
        trueValue = '1天';
        break;
      case '1周':
      case '1w':
        trueValue = '1周';
        break;
      case '1月':
      case '1M':
        trueValue = '1月';
        break;
      case '1年':
      case '1y':
        trueValue = '1年';
        break;
      case '其他':
      case 'other':
        trueValue = '其他';
        break;
      default:
        break;
    };
    return trueValue;
  };
  return {
    restrict: 'E',
    scope: {
      model: '=', // The interval model
    },
    template: html,
    link: function ($scope, $elem) {
      //$scope.intervalOptions = ['auto', '1s', '1m', '1h', '1d', '1w', '1M', '1y', 'other'];
      let lang = $translate.use();
      if (lang === 'en-us') {
        $scope.intervalOptions = ['auto', '1s', '1m', '1h', '1d', '1w', '1M', '1y', 'other'];
      } else if (lang === 'zh-tw') {
        $scope.intervalOptions = ['自動', '1秒鐘', '1分鐘', '1小時', '1天', '1周', '1月', '1年', '其他'];
      } else {
        $scope.intervalOptions = ['自动', '1秒钟', '1分钟', '1小时', '1天', '1周', '1月', '1年', '其他'];
      }

      $scope.$watch('model', function (newVal, oldVal) {
        // Only run this on initialization
        if (newVal !== oldVal || oldVal == null) return;

        if (_.contains($scope.intervalOptions, newVal)) {
          $scope.interval = $translate.instant(newVal);
        } else {
          $scope.interval = 'other';
        }

        if (newVal !== 'other' || newVal !== '其他') {
          //$scope.otherInterval = newVal;
          if (lang === 'en-us') {
            $scope.otherInterval = changeVauleEn(newVal);
          } else if (lang === 'zh-cn') {
            $scope.otherInterval = changeVauleCn(newVal);
          } else {
            $scope.otherInterval = changeVauleTw(newVal);
          }
          //$scope.otherInterval = $translate.instant(newVal);
        }
      });

      $scope.$watch('interval', function (newVal, oldVal) {
        if (newVal === oldVal) return;

        if (newVal === 'other' || newVal === '其他') {
          //$scope.otherInterval = oldVal;
          if (lang === 'en-us') {
            $scope.otherInterval = changeVauleEn(oldVal);
          } else if (lang === 'zh-cn') {
            $scope.otherInterval = changeVauleCn(oldVal);
          } else {
            $scope.otherInterval = changeVauleTw(oldVal);
          }
          //$scope.otherInterval = $translate.instant(oldVal);

          $scope.model = $scope.otherInterval;
          $timeout(function () {
            $('input', $elem).select();
          }, 0);
        } else {
          //$scope.otherInterval = $scope.interval;
          if (lang === 'en-us') {
            $scope.otherInterval = changeVauleEn(newVal);
          } else if (lang === 'zh-cn') {
            $scope.otherInterval = changeVauleCn(newVal);
          } else {
            $scope.otherInterval = changeVauleTw(newVal);
          }
          //$scope.otherInterval = $translate.instant($scope.interval);
          $scope.model = $scope.interval;
        }
      });

      $scope.$watch('otherInterval', function (newVal, oldVal) {
        if (newVal === oldVal) return;
        $scope.model = newVal;
      });


    }
  };
});
