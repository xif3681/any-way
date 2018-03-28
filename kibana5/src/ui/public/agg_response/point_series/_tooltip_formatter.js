import $ from 'jquery';
import moment from 'moment';
import 'ui/filters/moment';
import _ from 'lodash';
export default function PointSeriesTooltipFormatter($compile, $rootScope,config,$translate, $translatePartialLoader) {

  //luo.chunxiang@eisoo.com
  $translatePartialLoader.addPart('../plugins/kibana/discover');
  $translate.refresh();


  let $tooltipScope = $rootScope.$new();
  let $tooltip = $(require('ui/agg_response/point_series/_tooltip.html'));
  $compile($tooltip)($tooltipScope);

  //luo.chunxiang@eisoo.com
  var format = config.get('dateFormat');
  var lang = window.localStorage.lang;
  var invalidDate;
  if (lang === 'en-us') {
    format = 'MMMM Do YYYY, HH:mm:ss.SSS';
    invalidDate = 'Invalid date';
  } else if (lang === 'zh-tw') {
    format = 'YYYY年MM月DD日, HH:mm:ss.SSS';
    invalidDate = '日期無效';
  } else {
    format = 'YYYY年MM月DD日, HH:mm:ss.SSS';
    invalidDate = '日期无效';
  }
  var findTimes = function (times) {
    var time = times;
    if (time) {
      if (times.indexOf('@timestamp') > -1 && times.indexOf('milliseconds') > -1 || times.indexOf('seconds') > -1 ||
       times.indexOf('minutes') > -1 || times.indexOf('hours') > -1) {
        var arr = times.split(' ');
        var str1 = $translate.instant(arr[0]);
        var str2 = $translate.instant(arr[1]);
        var num = arr[2];
        var str = $translate.instant(arr[3]);
        time = str1 + str2 + num + str;
      } else {
        time = $translate.instant(times);
      }
    }

    return time;
  };

  return function tooltipFormatter(event) {
    let datum = event.datum;
    if (!datum || !datum.aggConfigResult) return '';

    let details = $tooltipScope.details = [];
    let result = { $parent: datum.aggConfigResult };

    function addDetail(result) {
      let agg = result.aggConfig;
      let value = result.value;
      let detail = {
        value: agg.fieldFormatter()(value),
        label: findTimes(agg.makeLabel())
      };


      if (agg === datum.aggConfigResult.aggConfig) {
        detail.percent = event.percent;
        if (datum.yScale != null) {
          detail.value = agg.fieldFormatter()(value * datum.yScale);
        }
      }

      details.push(detail);
    }

    datum.extraMetrics.forEach(addDetail);
    while ((result = result.$parent) && result.aggConfig) {
      addDetail(result);
    }


    $tooltipScope.$apply();
    return $tooltip[0].outerHTML;
  };
};
