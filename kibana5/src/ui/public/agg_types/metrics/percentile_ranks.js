import _ from 'lodash';
import valuesEditor from 'ui/agg_types/controls/percentile_ranks.html';
import 'ui/number_list';
import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';
import AggTypesMetricsGetResponseAggConfigClassProvider from 'ui/agg_types/metrics/get_response_agg_config_class';
import RegistryFieldFormatsProvider from 'ui/registry/field_formats';
import getPercentileValue from './percentiles_get_value';

export default function AggTypeMetricPercentileRanksProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var PercentileRanksOf;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '百分等级';
    PercentileRanksOf = '的百分等级';

  } else if (lang === 'zh-tw') {
    titleOption = '百分等级';
    PercentileRanksOf = '的百分等级';

  } else {
    titleOption = 'Percentile Ranks';
    PercentileRanksOf = 'Percentile Ranks of ';

  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);
  let getResponseAggConfigClass = Private(AggTypesMetricsGetResponseAggConfigClassProvider);
  let fieldFormats = Private(RegistryFieldFormatsProvider);

  // required by the values editor

  let valueProps = {
    makeLabel: function () {
      let field = this.field();
      let format = (field && field.format) || fieldFormats.getDefaultInstance('number');
      const label = this.params.customLabel || this.fieldDisplayName();
      if (lang === 'en-us') {
        return 'Percentile rank ' + format.convert(this.key, 'text') + ' of "' + label + '"';
      } else {
        return '在' + label + '中排百分之' + format.convert(this.key, 'text');
      }
      //return 'Percentile rank ' + format.convert(this.key, 'text') + ' of "' + label + '"';
    }
  };

  return new MetricAggType({
    name: 'percentile_ranks',
    title: titleOption,
    makeLabel: function (agg) {
      if (lang === 'en-us') {
        return PercentileRanksOf + agg.fieldDisplayName();
      } else {
        return agg.fieldDisplayName() + PercentileRanksOf;
      }
      //return 'Percentile ranks of ' + agg.fieldDisplayName();
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number'
      },
      {
        name: 'values',
        editor: valuesEditor,
        default: []
      },
      {
        write(agg, output) {
          output.params.keyed = false;
        }
      }
    ],
    getResponseAggs: function (agg) {
      let ValueAggConfig = getResponseAggConfigClass(agg, valueProps);

      return agg.params.values.map(function (value) {
        return new ValueAggConfig(value);
      });
    },
    getFormat: function () {
      return fieldFormats.getInstance('percent') || fieldFormats.getDefaultInstance('number');
    },
    getValue: function (agg, bucket) {
      return getPercentileValue(agg, bucket) / 100;
    }
  });
};
