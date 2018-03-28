import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';

export default function AggTypeMetricAvgProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var Average;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '平均值';
    Average = '的平均值';
  } else if (lang === 'zh-tw') {
    titleOption = '平均值';
    Average = '的平均值';
  } else {
    titleOption = 'Average';
    Average = 'Average ';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);

  return new MetricAggType({
    name: 'avg',
    title: titleOption,
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return Average + aggConfig.params.field.displayName;
      } else {
        return aggConfig.params.field.displayName + Average;
      }
      //return 'Average ' + aggConfig.params.field.displayName;
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number'
      }
    ]
  });
};
