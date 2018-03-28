import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';

export default function AggTypeMetricMinProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var Min;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '最小值';
    Min = '的最小值';
  } else if (lang === 'zh-tw') {
    titleOption = '最小值';
    Min = '的最小值';
  } else {
    titleOption = 'Min';
    Min = 'Min ';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);

  return new MetricAggType({
    name: 'min',
    title: titleOption,
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return Min + aggConfig.params.field.displayName;
      } else {
        return aggConfig.params.field.displayName + Min;
      }
      //return 'Min ' + aggConfig.params.field.displayName;
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number,date'
      }
    ]
  });
};
