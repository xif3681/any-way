import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';
import RegistryFieldFormatsProvider from 'ui/registry/field_formats';

export default function AggTypeMetricCardinalityProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var UniqueCountOf;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '去重计数';
    UniqueCountOf = '的去重计数';
  } else if (lang === 'zh-tw') {
    titleOption = '去重計數';
    UniqueCountOf = '的去重計數';
  } else {
    titleOption = 'Unique Count';
    UniqueCountOf = 'Unique Count of ';
  }

  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);
  let fieldFormats = Private(RegistryFieldFormatsProvider);

  return new MetricAggType({
    name: 'cardinality',
    title: titleOption,
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return UniqueCountOf + aggConfig.params.field.displayName;
      } else {
        return aggConfig.params.field.displayName + UniqueCountOf;
      }
      //return 'Unique count of ' + aggConfig.params.field.displayName;
    },
    getFormat: function () {
      return fieldFormats.getDefaultInstance('number');
    },
    params: [
      {
        name: 'field'
      }
    ]
  });
};
