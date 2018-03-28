import _ from 'lodash';
import AggTypesBucketsBucketAggTypeProvider from 'ui/agg_types/buckets/_bucket_agg_type';
import AggTypesBucketsCreateFilterTermsProvider from 'ui/agg_types/buckets/create_filter/terms';
import orderAndSizeTemplate from 'ui/agg_types/controls/order_and_size.html';
export default function SignificantTermsAggDefinition(Private,$translate) {
  //luochunxiang@eisoo.com
  var titleOption;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    titleOption = '重要词条';
  } else if (lang === 'zh-tw') {
    titleOption = '重要條件';
  } else {
    titleOption = 'Significant Terms';
  }
  let BucketAggType = Private(AggTypesBucketsBucketAggTypeProvider);
  let createFilter = Private(AggTypesBucketsCreateFilterTermsProvider);

  return new BucketAggType({
    name: 'significant_terms',
    title: titleOption,
    makeLabel: function (aggConfig) {
      if (lang === 'en-us') {
        return 'Top ' + aggConfig.params.size + ' unusual terms in ' + aggConfig.params.field.displayName;
      } else if (lang === 'zh-cn') {
        return aggConfig.params.field.displayName + '字段中最特殊的' + aggConfig.params.size + '个值';
      } else {
        return aggConfig.params.field.displayName + '欄位中最特殊的' + aggConfig.params.size + '個值';
      }
      //return 'Top ' + aggConfig.params.size + ' unusual terms in ' + aggConfig.params.field.displayName;
    },
    createFilter: createFilter,
    params: [
      {
        name: 'field',
        filterFieldTypes: 'string'
      },
      {
        name: 'size',
        editor: orderAndSizeTemplate,
      },
      {
        name: 'exclude',
        type: 'regex',
        advanced: true
      },
      {
        name: 'include',
        type: 'regex',
        advanced: true
      }
    ]
  });
};
