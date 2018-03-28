import moment from 'moment';
import dateRange from 'ui/utils/date_range';
import 'ui/directives/validate_date_math';
import AggTypesBucketsBucketAggTypeProvider from 'ui/agg_types/buckets/_bucket_agg_type';
import RegistryFieldFormatsProvider from 'ui/registry/field_formats';
import startTimesTemplate from 'ui/agg_types/controls/start_times.html';
import endTimesTemplate from 'ui/agg_types/controls/end_times.html';

export default function DateRangeAggDefinition(Private, config, $translate) {

  //luochunxiang@eisoo.com
  var titleOption;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    titleOption = '进度字段';
  } else if (lang === 'zh-tw') {
    titleOption = '进度字段';
  } else {
    titleOption = '进度字段';
  }
  let BucketAggType = Private(AggTypesBucketsBucketAggTypeProvider);
  let fieldFormats = Private(RegistryFieldFormatsProvider);


  return new BucketAggType({
    name: 'start_end_times',
    title: titleOption,
    getKey: function (bucket, key, agg) {
      let formatter = agg.fieldOwnFormatter('text', fieldFormats.getDefaultInstance('date'));
      return dateRange.toString(bucket, formatter);
    },
    getFormat: function () {
      return fieldFormats.getDefaultInstance('string');
    },
    /**
     * 当x轴闭合的时候，显示在界面上的数据
     * @param agg 不要写为aggConfig
     * @returns {string}
     */
    makeLabel: function (agg) {
      if (!agg.params.start_times || !agg.params.end_times) {
        return;
      }
      return agg.params.start_times.displayName + '  ' + agg.params.end_times.displayName;
    },
    params: [{
      name: 'start_times',
      filterFieldTypes: 'date'
    }, {
      name: 'end_times',
      filterFieldTypes: 'date'
    },]
  });
};
