import html from 'ui/timepicker/timepicker.html';
import _ from 'lodash';
import dateMath from '@elastic/datemath';
import moment from 'moment';
import Notifier from 'ui/notify/notifier';
import 'ui/directives/input_datetime';
import 'ui/directives/inequality';
import 'ui/timepicker/quick_ranges';
import 'ui/timepicker/refresh_intervals';
import 'ui/timepicker/time_units';
import 'ui/timepicker/kbn_global_timepicker';
import 'ui/timepicker/ar_global_timepicker';
import uiModules from 'ui/modules';
let module = uiModules.get('ui/timepicker');
let notify = new Notifier({
  location: 'timepicker',
});

module.directive('kbnTimepicker', function (quickRanges, timeUnits, refreshIntervals,T) {
  return {
    restrict: 'E',
    scope: {
      from: '=',
      to: '=',
      mode: '=',
      interval: '=',
      activeTab: '='
    },
    template: html,
    controller: function ($scope) {
      //$scope.format = 'MMMM Do YYYY, HH:mm:ss.SSS';
      //luo.chunxiang@eisoo.com
      var message;
      var lang = window.localStorage.lang;
      if (lang === 'en-us') {
        message = 'MMMM Do YYYY, HH:mm:ss.SSS';
      } else if (lang === 'zh-tw') {
        message = 'YYYY年MM月DD日, HH:mm:ss.SSS';
      } else {
        message = 'YYYY年MM月DD日, HH:mm:ss.SSS';
      }
      $scope.format = message;
      $scope.modes = ['quick', 'relative', 'absolute'];
      $scope.activeTab = $scope.activeTab || 'filter';

      if (_.isUndefined($scope.mode)) $scope.mode = 'quick';

      $scope.quickLists = _(quickRanges).groupBy('section').values().value();
      $scope.refreshLists = _(refreshIntervals).groupBy('section').values().value();

      $scope.relative = {
        count: 1,
        unit: 'm',
        preview: undefined,
        round: false
      };

      $scope.absolute = {
        from: moment(),
        to: moment()
      };

      $scope.units = timeUnits;

      //luochunxiang@eisoo.com

      $scope.relativeOptions = [
        {text: T.t('Seconds ago'), value: 's'},
        {text: T.t('Minutes ago'), value: 'm'},
        {text: T.t('Hours ago'), value: 'h'},
        {text: T.t('Days ago'), value: 'd'},
        {text: T.t('Weeks ago'), value: 'w'},
        {text: T.t('Months ago'), value: 'M'},
        {text: T.t('Years ago'), value: 'y'},
      ];


      $scope.$watch('from', function (date) {
        if (moment.isMoment(date) && $scope.mode === 'absolute') {
          $scope.absolute.from = date;
        }
      });

      $scope.$watch('to', function (date) {
        if (moment.isMoment(date) && $scope.mode === 'absolute') {
          $scope.absolute.to = date;
        }
      });

      $scope.$watch('absolute.from', function (date) {
        if (_.isDate(date)) $scope.absolute.from = moment(date);
      });

      $scope.$watch('absolute.to', function (date) {
        if (_.isDate(date)) $scope.absolute.to = moment(date);
      });

      $scope.setMode = function (thisMode) {
        switch (thisMode) {
          case 'quick':
            break;
          case 'relative':
            let fromParts = $scope.from.toString().split('-');
            let relativeParts = [];

            // Try to parse the relative time, if we can't use moment duration to guestimate
            if ($scope.to.toString() === 'now' && fromParts[0] === 'now' && fromParts[1]) {
              relativeParts = fromParts[1].match(/([0-9]+)([smhdwMy]).*/);
            }
            if (relativeParts[1] && relativeParts[2]) {
              $scope.relative.count = parseInt(relativeParts[1], 10);
              $scope.relative.unit = relativeParts[2];
            } else {
              let duration = moment.duration(moment().diff(dateMath.parse($scope.from)));
              let units = _.pluck(_.clone($scope.relativeOptions).reverse(), 'value');
              if ($scope.from.toString().split('/')[1]) $scope.relative.round = true;
              for (let i = 0; i < units.length; i++) {
                let as = duration.as(units[i]);
                if (as > 1) {
                  $scope.relative.count = Math.round(as);
                  $scope.relative.unit = units[i];
                  break;
                }
              }
            }

            if ($scope.from.toString().split('/')[1]) $scope.relative.round = true;
            $scope.formatRelative();

            break;
          case 'absolute':
            $scope.absolute.from = dateMath.parse($scope.from || moment().subtract(15, 'minutes'));
            $scope.absolute.to = dateMath.parse($scope.to || moment(), true);
            break;
        }

        $scope.mode = thisMode;
      };

      $scope.setQuick = function (from, to) {
        $scope.from = from;
        $scope.to = to;
      };

      $scope.setToNow = function () {
        $scope.absolute.to = moment();
      };

      $scope.formatRelative = function () {
        let parsed = dateMath.parse(getRelativeString());
        $scope.relative.preview =  parsed ? parsed.format($scope.format) : undefined;
        return parsed;
      };

      $scope.applyRelative = function () {
        $scope.from = getRelativeString();
        $scope.to = 'now';
      };

      function getRelativeString() {
        return 'now-' + $scope.relative.count + $scope.relative.unit + ($scope.relative.round ? '/' + $scope.relative.unit : '');
      }

      $scope.applyAbsolute = function () {
        $scope.from = moment($scope.absolute.from);
        $scope.to = moment($scope.absolute.to);
      };

      $scope.setRefreshInterval = function (interval) {
        interval = _.clone(interval || {});
        notify.log('before: ' + interval.pause);
        interval.pause = (interval.pause == null || interval.pause === false) ? false : true;

        notify.log('after: ' + interval.pause);

        $scope.interval = interval;
      };

      $scope.setMode($scope.mode);
    }
  };
});
