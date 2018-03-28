import _ from 'lodash';
import angular from 'angular';
import AggTypesBucketsBucketAggTypeProvider from 'ui/agg_types/buckets/_bucket_agg_type';
import AggTypesBucketsCreateFilterFiltersProvider from 'ui/agg_types/buckets/create_filter/filters';
import DecorateQueryProvider from 'ui/courier/data_source/_decorate_query';
import filtersTemplate from 'ui/agg_types/controls/filters.html';
export default function FiltersAggDefinition(Private, Notifier, $translate) {
  //luochunxiang@eisoo.com
  var titleOption;
  var Labels;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    titleOption = '过滤器';
    Labels = '标签';
  } else if (lang === 'zh-tw') {
    titleOption = '篩檢程式';
    Labels = '標籤';
  } else {
    titleOption = 'Filters';
    Labels = 'Label';
  }
  let BucketAggType = Private(AggTypesBucketsBucketAggTypeProvider);
  let createFilter = Private(AggTypesBucketsCreateFilterFiltersProvider);
  let decorateQuery = Private(DecorateQueryProvider);
  let notif = new Notifier({ location: 'Filters Agg' });

  return new BucketAggType({
    name: 'filters',
    title: titleOption,
    createFilter: createFilter,
    customLabels: false,
    params: [
      {
        name: 'filters',
        editor: filtersTemplate,
        default: [ {input: {}, label: ''} ],
        write: function (aggConfig, output) {
          let inFilters = aggConfig.params.filters;
          if (!_.size(inFilters)) return;

          let outFilters = _.transform(inFilters, function (filters, filter) {
            let input = filter.input;
            if (!input) return notif.log('malformed filter agg params, missing "input" query');

            let query = input.query;
            if (!query) return notif.log('malformed filter agg params, missing "query" on input');

            decorateQuery(query);

            let label = filter.label || _.get(query, 'query_string.query') || angular.toJson(query);
            filters[label] = input;
          }, {});

          if (!_.size(outFilters)) return;

          let params = output.params || (output.params = {});
          params.filters = outFilters;
        }
      }
    ]
  });
};
