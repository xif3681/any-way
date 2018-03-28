import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';

export default function AggTypeMetricMaxProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var Max;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '最大值';
    Max = '的最大值';
  } else if (lang === 'zh-tw') {
    titleOption = '最大值';
    Max = '的最大值';
  } else {
    titleOption = 'Max';
    Max = 'Max ';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);

  return new MetricAggType({
    name: 'max',
    title: titleOption,
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return Max + aggConfig.params.field.displayName;
      } else {
        return aggConfig.params.field.displayName + Max;
      }
      //return 'Max ' + aggConfig.params.field.displayName;
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number,date'
      }
    ]
  });
};
