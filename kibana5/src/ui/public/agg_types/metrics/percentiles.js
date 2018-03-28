import _ from 'lodash';
import ordinalSuffix from 'ui/utils/ordinal_suffix';
import percentsEditor from 'ui/agg_types/controls/percentiles.html';
import 'ui/number_list';
import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';
import AggTypesMetricsGetResponseAggConfigClassProvider from 'ui/agg_types/metrics/get_response_agg_config_class';
import RegistryFieldFormatsProvider from 'ui/registry/field_formats';
import getPercentileValue from './percentiles_get_value';

export default function AggTypeMetricPercentilesProvider(Private) {
  //luochunxiang@eisoo.com
  var titleOption;
  var PercentilesOf;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '百分比分布';
    PercentilesOf = '的百分比分布';
  } else if (lang === 'zh-tw') {
    titleOption = '百分比分佈';
    PercentilesOf = '的百分比分佈';
  } else {
    titleOption = 'Percentiles';
    PercentilesOf = 'Percentiles of ';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);
  let getResponseAggConfigClass = Private(AggTypesMetricsGetResponseAggConfigClassProvider);
  let fieldFormats = Private(RegistryFieldFormatsProvider);

  // required by the percentiles editor

  let valueProps = {
    makeLabel: function () {
      const label = this.params.customLabel || this.fieldDisplayName();
      if (lang === 'en-us') {
        if (this.key = '50') {
          return 'Median ' + label;
        } else {
          return ordinalSuffix(this.key) + ' percentile of ' + label;
        }
      } else {
        if (this.key = '50') {
          return label + '的中值';
        } else {
          return this.key + '%' + '的' + label;
        }
      }
      //return ordinalSuffix(this.key) + ' percentile of ' + label;
    }
  };

  return new MetricAggType({
    name: 'percentiles',
    title: titleOption,
    makeLabel: function (agg) {
      if (lang === 'en-us') {
        return PercentilesOf + agg.fieldDisplayName();
      } else {
        return agg.fieldDisplayName() + PercentilesOf;
      }
      //return 'Percentiles of ' + agg.fieldDisplayName();
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number'
      },
      {
        name: 'percents',
        editor: percentsEditor,
        default: [1, 5, 25, 50, 75, 95, 99]
      },
      {
        write(agg, output) {
          output.params.keyed = false;
        }
      }
    ],
    getResponseAggs: function (agg) {
      let ValueAggConfig = getResponseAggConfigClass(agg, valueProps);

      return agg.params.percents.map(function (percent) {
        return new ValueAggConfig(percent);
      });
    },
    getValue: getPercentileValue
  });
};
