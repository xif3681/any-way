import _ from 'lodash';
import dateMath from '@elastic/datemath';
import moment from 'moment';
import 'ui/timepicker/quick_ranges';
import 'ui/timepicker/time_units';
import uiModules from 'ui/modules';
let module = uiModules.get('kibana');
var lang = window.localStorage.lang;
if (lang === 'zh-cn') {
  moment.locale('zh-cn', {
    relativeTime : {
      future : '%s内',
      past : '%s前',
      s : '几秒',
      m : '1 分钟',
      mm : '%d 分钟',
      h : '1 小时',
      hh : '%d 小时',
      d : '1 天',
      dd : '%d 天',
      M : '1 个月',
      MM : '%d 个月',
      y : '1 年',
      yy : '%d 年'
    }

  });
} else if (lang === 'zh-tw') {
  moment.locale('zh-cn', {
    relativeTime : {
      future : '%s內',
      past : '%s前',
      s : '幾秒',
      m : '一分鐘',
      mm : '%d分鐘',
      h : '一小時',
      hh : '%d小時',
      d : '一天',
      dd : '%d天',
      M : '一個月',
      MM : '%d個月',
      y : '一年',
      yy : '%d年'
    }

  });
}

module.directive('prettyDuration', function (config, quickRanges, timeUnits, $translate, $translatePartialLoader,T) {
  //luo.chunxiang@eisoo.com
  $translatePartialLoader.addPart('../plugins/kibana/discover');
  $translate.refresh();
  return {
    restrict: 'E',
    scope: {
      from: '=',
      to: '='
    },
    link: function ($scope, $elem) {

      let dateFormat = config.get('dateFormat');
      //luo.chunxiang@eisoo.com
      var lang = window.localStorage.lang;
      var Last;
      var roundedToThe;
      var to;
      if (lang === 'en-us') {
        dateFormat = 'MMMM Do YYYY, HH:mm:ss.SSS';
        Last = 'Last ';
        roundedToThe = ' rounded to the ';
        to = ' to ';
      } else if (lang === 'zh-tw') {
        dateFormat = 'YYYY年MM月DD日, HH:mm:ss.SSS';
        Last = '最近';
        roundedToThe = '保留到';
        to = '到';
      } else {
        dateFormat = 'YYYY年MM月DD日, HH:mm:ss.SSS';
        Last = '最近';
        roundedToThe = '保留到';
        to = '到';
      }
      let lookupByRange = {};
      _.each(quickRanges, function (frame) {
        lookupByRange[frame.from + ' to ' + frame.to] = frame;
      });

      var changeMe = function (ccc) {
        let lang = window.localStorage.lang;
        if (lang === 'en-us') {
          switch (ccc) {
            case 's':
              ccc = 'second';
              break;
            case 'm':
              ccc = 'minute';
              break;
            case 'h':
              ccc = 'hour';
              break;
            case 'd':
              ccc = 'day';
              break;
            case 'w':
              ccc = 'week';
              break;
            case 'M':
              ccc = 'month';
              break;
            case 'y':
              ccc = 'year';
            default:;
          };
        } else if (lang === 'zh-tw') {
          switch (ccc) {
            case 's':
              ccc = '秒';
              break;
            case 'm':
              ccc = '分鐘';
              break;
            case 'h':
              ccc = '小時';
              break;
            case 'd':
              ccc = '天';
              break;
            case 'w':
              ccc = '周';
              break;
            case 'M':
              ccc = '月';
              break;
            case 'y':
              ccc = '年';
            default:;
          };
        } else {
          switch (ccc) {
            case 's':
              ccc = '秒';
              break;
            case 'm':
              ccc = '分钟';
              break;
            case 'h':
              ccc = '小时';
              break;
            case 'd':
              ccc = '天';
              break;
            case 'w':
              ccc = '周';
              break;
            case 'M':
              ccc = '月';
              break;
            case 'y':
              ccc = '年';
            default:;
          };
        }
        return ccc;

      };

      function stringify() {
        $translatePartialLoader.addPart('../plugins/kibana/discover');
        $translate.refresh();
        let text;
        // let Last = last;
        // let roundedToThe = roundToThe;
        // If both parts are date math, try to look up a reasonable string
        if ($scope.from && $scope.to && !moment.isMoment($scope.from) && !moment.isMoment($scope.to)) {
          let tryLookup = lookupByRange[$scope.from.toString() + ' to ' + $scope.to.toString()];
          // if (tryLookup) {
          //   $elem.text(tryLookup.display);
          // } else {
          //   let fromParts = $scope.from.toString().split('-');
          //   if ($scope.to.toString() === 'now' && fromParts[0] === 'now' && fromParts[1]) {
          //     let rounded = fromParts[1].split('/');
          //     text = 'Last ' + rounded[0];
          //     if (rounded[1]) {
          //       text = text + ' rounded to the ' + timeUnits[rounded[1]];
          //     }
          //     $elem.text(text);
          //   } else {
          //     cantLookup();
          //   }
          // }
          //luochunxiang@eisoo.com
          if (tryLookup) {
            var aaa = $translate.instant(tryLookup.display);
            //$elem.text(tryLookup.display);
            $elem.text($translate.instant(aaa));
          } else {
            var fromParts = $scope.from.toString().split('-');
            if ($scope.to.toString() === 'now' && fromParts[0] === 'now' && fromParts[1]) {
              var rounded = fromParts[1].split('/');
              //luochunxiang@eisoo.com
              var bbb = parseInt(rounded[0]);
              var ccc = rounded[0].substr(-1, 1);
              // switch (ccc) {
              //   case 's':
              //     ccc = 'second';
              //     break;
              //   case 'm':
              //     ccc = 'minute';
              //     break;
              //   case 'h':
              //     ccc = 'hour';
              //     break;
              //   case 'd':
              //     ccc = 'day';
              //     break;
              //   case 'w':
              //     ccc = 'week';
              //     break;
              //   case 'M':
              //     ccc = 'month';
              //     break;
              //   case 'y':
              //     ccc = 'year';
              //   default:;
              // };
              var eee = changeMe(ccc);
              text = Last + bbb + eee;
              if (rounded[1]) {
                var ddd = $translate.instant(timeUnits[rounded[1]]);
                text = text + roundedToThe + ddd;
              }

              $elem.text(text);
            } else {
              cantLookup();
            }
          }
        // If at least one part is a moment, try to make pretty strings by parsing date math
        } else {
          cantLookup();
        }
      };

      stringify();

      function cantLookup() {
        let display = {};
        // let to = $translate.instant('to');
        _.each(['from', 'to'], function (time) {
          if (moment.isMoment($scope[time])) {
            display[time] = $scope[time].format(dateFormat);
          } else {
            if ($scope[time] === 'now') {
              display[time] = 'now';
            } else {
              let tryParse = dateMath.parse($scope[time], time === 'to' ? true : false);
              display[time] = moment.isMoment(tryParse) ? '~ ' + tryParse.fromNow() : $scope[time];
            }
          }
        });
        $elem.text(display.from + to + display.to);
      };

      $scope.$watch('from', stringify);
      $scope.$watch('to', stringify);

    }
  };
});

