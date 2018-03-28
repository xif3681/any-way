import _ from 'lodash';
import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';
import AggTypesMetricsGetResponseAggConfigClassProvider from 'ui/agg_types/metrics/get_response_agg_config_class';
import AggTypesMetricsPercentilesProvider from 'ui/agg_types/metrics/percentiles';
export default function AggTypeMetricMedianProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var Median;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '中值';
    Median = '的中值';
  } else if (lang === 'zh-tw') {
    titleOption = '中值';
    Median = '的中值';
  } else {
    titleOption = 'Median';
    Median = 'Median ';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);
  let getResponseAggConfigClass = Private(AggTypesMetricsGetResponseAggConfigClassProvider);
  let percentiles = Private(AggTypesMetricsPercentilesProvider);

  return new MetricAggType({
    name: 'median',
    dslName: 'percentiles',
    title: titleOption,
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return Median + aggConfig.params.field.displayName;
      } else {
        return aggConfig.params.field.displayName + Median;
      }
      //return 'Median ' + aggConfig.params.field.displayName;
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number'
      },
      {
        name: 'percents',
        default: [50]
      },
      {
        write(agg, output) {
          output.params.keyed = false;
        }
      }
    ],
    getResponseAggs: percentiles.getResponseAggs,
    getValue: percentiles.getValue
  });
};
