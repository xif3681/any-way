import _ from 'lodash';
import moment from 'moment';
import 'ui/validate_date_interval';
import AggTypesBucketsBucketAggTypeProvider from 'ui/agg_types/buckets/_bucket_agg_type';
import AggTypesBucketsCreateFilterHistogramProvider from 'ui/agg_types/buckets/create_filter/histogram';
import intervalTemplate from 'ui/agg_types/controls/interval.html';
import minDocCountTemplate from 'ui/agg_types/controls/min_doc_count.html';
import extendedBoundsTemplate from 'ui/agg_types/controls/extended_bounds.html';
export default function HistogramAggDefinition(Private,$translate) {
  //luochunxiang@eisoo.com
  var titleOption;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    titleOption = '直方图';
  } else if (lang === 'zh-tw') {
    titleOption = '長條圖';
  } else {
    titleOption = 'Histogram';
  }
  let BucketAggType = Private(AggTypesBucketsBucketAggTypeProvider);
  let createFilter = Private(AggTypesBucketsCreateFilterHistogramProvider);


  return new BucketAggType({
    name: 'histogram',
    title: titleOption,
    ordered: {},
    makeLabel: function (aggConfig) {
      return aggConfig.params.field.displayName;
    },
    createFilter: createFilter,
    params: [
      {
        name: 'field',
        filterFieldTypes: 'number'
      },

      {
        name: 'interval',
        editor: intervalTemplate,
        write: function (aggConfig, output) {
          output.params.interval = parseInt(aggConfig.params.interval, 10);
        }
      },

      {
        name: 'min_doc_count',
        default: null,
        editor: minDocCountTemplate,
        write: function (aggConfig, output) {
          if (aggConfig.params.min_doc_count) {
            output.params.min_doc_count = 0;
          } else {
            output.params.min_doc_count = 1;
          }
        }
      },

      {
        name: 'extended_bounds',
        default: {},
        editor: extendedBoundsTemplate,
        write: function (aggConfig, output) {
          let val = aggConfig.params.extended_bounds;

          if (aggConfig.params.min_doc_count && (val.min != null || val.max != null)) {
            output.params.extended_bounds = {
              min: val.min,
              max: val.max
            };
          }
        },

        // called from the editor
        shouldShow: function (aggConfig) {
          let field = aggConfig.params.field;
          if (
            field
            && (field.type === 'number' || field.type === 'date')
          ) {
            return aggConfig.params.min_doc_count;
          }
        }
      }
    ]
  });
};
