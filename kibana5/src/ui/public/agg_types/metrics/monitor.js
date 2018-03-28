import _ from 'lodash';
import 'ui/agg_types/agg_style.less';
import angular from 'angular';
import AggTypesBucketsBucketAggTypeProvider from 'ui/agg_types/buckets/_bucket_agg_type';
import AggTypesBucketsCreateFilterFiltersProvider from 'ui/agg_types/buckets/create_filter/filters';
import DecorateQueryProvider from 'ui/courier/data_source/_decorate_query';
import monitorsTemplate from 'ui/agg_types/controls/monitors.html';
export default function MonitorAggDefinition(Private, Notifier, $translate, $translatePartialLoader, getFields) {
  let BucketAggType = Private(AggTypesBucketsBucketAggTypeProvider);
  let createFilter = Private(AggTypesBucketsCreateFilterFiltersProvider);
  let decorateQuery = Private(DecorateQueryProvider);
  let notif = new Notifier({location: 'Monitors Agg'});
  //从后台获取select里面的值，并且对其过滤
  let fields = getFields();
 // let selectedExistFileAlarm = fields.resultFileAlarm;
  let selectedExistFileAlarm = fields.resultsNoKeyword;
  let selectedExistNumAlertFile = fields.resultNumAlertFile;
  let intervals = [{
    id: 1,
    value: '>',
  }, {
    id: 2,
    value: '=',
  }, {
    id: 3,
    value: '<',
  }, {
    id: 4,
    value: '<',
  }, {
    id: 5,
    value: 'in',
  }];
  return new BucketAggType({
    name: 'monitors',
    title: 'monitors',
    createFilter: createFilter,
    customLabels: false,
    params: [
      {
        name: 'name',
        default: ''
      },
      {
        name: 'color',
        default: '#da0000'
      },
      {
        name: 'type',
        default: 'count'
      },
      {
        name: 'fieldNames',
        default: selectedExistFileAlarm
      },
      {
        name: 'intervals',
        default: intervals
      },
      {
        name: 'monitors',
        default: [
          {
            interval: '',
            fieldName: '',
          }
        ],
        editor: monitorsTemplate,
        write: function (aggConfig, output) {
          if (aggConfig.enabled) {
            let inMonitors = aggConfig.params.monitors;
            if (!_.size(inMonitors)) return;
            let i = 0;
            let outMonitors = _.transform(inMonitors, function (monitors, monitor) {
              let fieldName = monitor.fieldName;
              let fieldValue = monitor.fieldValue;
              let interval = monitor.interval;
              let threshold = monitor.threshold;
              let upperThreshold = monitor.upperThreshold;
              monitors[i++] = {
                [fieldName]: {'query': fieldValue, 'type': 'phrase'}//传给后台的
              };
            }, {});

            if (!_.size(outMonitors)) return;

            // let params = output.params || (output.params = {});

            let params = (output.params = {name: output.params.name, color: output.params.color});
            params.match = outMonitors;

          }

        }
      }
    ]
  });
};
