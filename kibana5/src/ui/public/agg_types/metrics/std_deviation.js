import _ from 'lodash';
import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/metric_agg_type';
import AggTypesMetricsGetResponseAggConfigClassProvider from 'ui/agg_types/metrics/get_response_agg_config_class';
export default function AggTypeMetricStandardDeviationProvider(Private) {

  //luochunxiang@eisoo.com
  var titleOption;
  var StandardDeviation;
  var Standard;
  var Lower;
  var Upper;
  var lang = window.localStorage.lang;
  if (lang === 'zh-cn') {
    titleOption = '标准差';
    StandardDeviation = '的标准差';
    Standard = '标准差';
    Lower = '的上';
    Upper = '的下';
  } else if (lang === 'zh-tw') {
    titleOption = '標準差';
    StandardDeviation = '的標準差';
    Standard = '的標準差';
    Lower = '的上';
    Upper = '的下';
  } else {
    titleOption = 'Standard Deviation';
    StandardDeviation = 'Standard Deviation of ';
    Standard = 'Standard Deviation of ';
    Lower = 'Lower ';
    Upper = 'Upper ';
  }
  let MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);
  let getResponseAggConfigClass = Private(AggTypesMetricsGetResponseAggConfigClassProvider);

  let responseAggConfigProps = {
    valProp: function () {
      let details = this.keyedDetails(this.params.customLabel)[this.key];
      return details.valProp;
    },
    makeLabel: function () {
      const fieldDisplayName = this.fieldDisplayName();
      const details = this.keyedDetails(this.params.customLabel, fieldDisplayName);
      return _.get(details, [this.key, 'title']);
    },
    keyedDetails: function (customLabel, fieldDisplayName) {
      //const label = customLabel ? customLabel : Standard + fieldDisplayName;
      var label;
      var LowerLabel;
      var UpperLabel;
      if (lang === 'en-us') {
        label = customLabel ? customLabel : Standard + fieldDisplayName;
        LowerLabel = Lower + label;
        UpperLabel = Upper + label;
      } else {
        label = customLabel ? customLabel : fieldDisplayName + Standard;
        LowerLabel = customLabel ? customLabel + Lower + Standard : fieldDisplayName + Lower + Standard;
        UpperLabel = customLabel ? customLabel + Upper + Standard : fieldDisplayName + Upper + Standard;
      }
      return {
        std_lower: {
          valProp: ['std_deviation_bounds', 'lower'],
          title: LowerLabel
        },
        std_upper: {
          valProp: ['std_deviation_bounds', 'upper'],
          title: UpperLabel
        }
      };
    }
  };

  return new MetricAggType({
    name: 'std_dev',
    dslName: 'extended_stats',
    title: titleOption,
    makeLabel: function (agg) {
      if (lang === 'en-us') {
        return StandardDeviation + agg.fieldDisplayName();
      } else {
        return agg.fieldDisplayName() + StandardDeviation;
      }
      //return 'Standard Deviation of ' + agg.fieldDisplayName();
    },
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number'
      }
    ],

    getResponseAggs: function (agg) {
      let ValueAggConfig = getResponseAggConfigClass(agg, responseAggConfigProps);

      return [
        new ValueAggConfig('std_lower'),
        new ValueAggConfig('std_upper')
      ];
    },

    getValue: function (agg, bucket) {
      return _.get(bucket[agg.parentId], agg.valProp());
    }
  });
};
