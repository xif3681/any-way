import moment from 'moment';
import 'ui/directives/input_whole_number';
export default function IntervalOptionsService(Private,$translate) {

  // shorthand
  let ms = function (type) { return moment.duration(1, type).asMilliseconds(); };

  //luochunxiang@eisoo.com
  var Auto;
  var Millisecond;
  var Second;
  var Minute;
  var Hourly;
  var Daily;
  var Weekly;
  var Monthly;
  var Yearly;
  var Custom;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    Auto = '自动';
    Millisecond = '毫秒';
    Second = '每秒';
    Minute = '每分';
    Hourly = '每小时';
    Daily = '每天';
    Weekly = '每周';
    Monthly = '每月';
    Yearly = '每年';
    Custom = '自定义';
  } else if (lang === 'zh-tw') {
    Auto = '自動';
    Second = '每秒';
    Millisecond = '毫秒';
    Minute = '每分';
    Hourly = '每小时';
    Daily = '每天';
    Weekly = '每週';
    Monthly = '每月';
    Yearly = '每年';
    Custom = '自訂';
  } else {
    Auto = 'Auto';
    Millisecond = 'Millisecond';
    Second = 'Second';
    Minute = 'Minute';
    Hourly = 'Hourly';
    Daily = 'Daily';
    Weekly = 'Weekly';
    Monthly = 'Monthly';
    Yearly = 'Yearly';
    Custom = 'Custom';
  }

  return [
    {
      display: Auto,
      val: 'auto',
      enabled: function (agg) {
        // not only do we need a time field, but the selected field needs
        // to be the time field. (see #3028)
        return agg.fieldIsTimeField();
      }
    },
    {
      display: Millisecond,
      val: 'ms'
    },
    {
      display: Second,
      val: 's'
    },
    {
      display: Minute,
      val: 'm'
    },
    {
      display: Hourly,
      val: 'h'
    },
    {
      display: Daily,
      val: 'd'
    },
    {
      display: Weekly,
      val: 'w'
    },
    {
      display: Monthly,
      val: 'M'
    },
    {
      display: Yearly,
      val: 'y'
    },
    {
      display: Custom,
      val: 'custom'
    }
  ];
};
