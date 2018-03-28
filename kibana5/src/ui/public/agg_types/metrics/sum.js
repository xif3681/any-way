import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';

export default function AggTypeMetricSumProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var SumOf;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '总和';
    SumOf = '的总和';
  } else if (lang === 'zh-tw') {
    titleOption = '總和';
    SumOf = '的總和';
  } else {
    titleOption = 'Sum';
    SumOf = 'Sum of ';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);

  return new MetricAggType({
    name: 'sum',
    title: titleOption,
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return SumOf + aggConfig.params.field.displayName;
      } else {
        return aggConfig.params.field.displayName + SumOf;
      }
      //return 'Sum of ' + aggConfig.params.field.displayName;
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number'
      }
    ]
  });
};
