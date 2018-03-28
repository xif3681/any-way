import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';
import RegistryFieldFormatsProvider from 'ui/registry/field_formats';

export default function AggTypeMetricCountProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var Count;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '计数';
    Count = '计数';
  } else if (lang === 'zh-tw') {
    titleOption = '計數';
    Count = '計數';
  } else {
    titleOption = 'Count';
    Count = 'Count';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);
  let fieldFormats = Private(RegistryFieldFormatsProvider);

  return new MetricAggType({
    name: 'count',
    title: titleOption,
    hasNoDsl: true,
    makeLabel: function () {
      return titleOption;
    },
    getFormat: function () {
      return fieldFormats.getDefaultInstance('number');
    },
    getValue: function (agg, bucket) {
      return bucket.doc_count;
    }
  });
};
