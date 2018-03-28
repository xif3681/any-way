import moment from 'moment';
import dateRange from 'ui/utils/date_range';
import 'ui/directives/validate_date_math';
import AggTypesBucketsBucketAggTypeProvider from 'ui/agg_types/buckets/_bucket_agg_type';
import AggTypesBucketsCreateFilterDateRangeProvider from 'ui/agg_types/buckets/create_filter/date_range';
import RegistryFieldFormatsProvider from 'ui/registry/field_formats';
import dateRangesTemplate from 'ui/agg_types/controls/date_ranges.html';

export default function DateRangeAggDefinition(Private, config,$translate) {

  //luochunxiang@eisoo.com
  var titleOption;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    titleOption = '日期范围';
  } else if (lang === 'zh-tw') {
    titleOption = '日期範圍';
  } else {
    titleOption = 'Date Range';
  }
  let BucketAggType = Private(AggTypesBucketsBucketAggTypeProvider);
  let createFilter = Private(AggTypesBucketsCreateFilterDateRangeProvider);
  let fieldFormats = Private(RegistryFieldFormatsProvider);


  return new BucketAggType({
    name: 'date_range',
    title: titleOption,
    createFilter: createFilter,
    getKey: function (bucket, key, agg) {
      let formatter = agg.fieldOwnFormatter('text', fieldFormats.getDefaultInstance('date'));
      return dateRange.toString(bucket, formatter);
    },
    getFormat: function () {
      return fieldFormats.getDefaultInstance('string');
    },
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return aggConfig.params.field.displayName + ' date ranges';
      } else if (lang === 'zh-cn') {
        return aggConfig.params.field.displayName + '的日期范围';
      } else {
        return aggConfig.params.field.displayName + '的日期範圍';
      }
      //return aggConfig.params.field.displayName + ' date ranges';
    },
    params: [{
      name: 'field',
      filterFieldTypes: 'date',
      default: function (agg) {
        return agg.vis.indexPattern.timeFieldName;
      }
    }, {
      name: 'ranges',
      default: [{
        from: 'now-1w/w',
        to: 'now'
      }],
      editor: dateRangesTemplate
    }]
  });
};
