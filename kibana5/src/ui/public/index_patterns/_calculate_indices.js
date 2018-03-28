import _ from 'lodash';
import moment from 'moment';

// gets parsed value if given arg is a moment object
function timeValue(val) {
  return moment.isMoment(val) ? val.valueOf() : val;
}

// returns a properly formatted millisecond timestamp index constraint
function msConstraint(comparison, value) {
  return {
    [comparison]: timeValue(value),
    format: 'epoch_millis'
  };
}

// returns a new object with any indexes removed that do not include the
// time field
//
// fixme: this really seems like a bug that needs to be fixed in
//        elasticsearch itself, but this workaround will do for now
function omitIndicesWithoutTimeField(indices, timeFieldName) {
  return _.pick(indices, index => index.fields[timeFieldName]);
}
// let timeMetricRatiosFlag = -1;
export default function CalculateIndicesFactory(Promise, es, $rootScope,fieldStats) {

  // Uses the field stats api to determine the names of indices that need to
  // be queried against that match the given pattern and fall within the
  // given time range
  function calculateIndices(pattern, timeFieldName, start, stop, sortDirection) {
    return getFieldStats(pattern, timeFieldName, start, stop)
      .then(resp => omitIndicesWithoutTimeField(resp.indices, timeFieldName))
      .then(indices => sortIndexStats(indices, timeFieldName, sortDirection));
  };

  // creates the configuration hash that must be passed to the elasticsearch
  // client


  function getFieldStats(pattern, timeFieldName, start, stop) {

    const constraints = {};
    if (start) {
      constraints.max_value = msConstraint('gte', start);
    }
    if (stop) {
      constraints.min_value = msConstraint('lte', stop);
    }
    let timeField = [timeFieldName];
    let timeFieldObj = {
      [timeFieldName]: constraints
    };
    /**
     * 用来检测当前是否为visualize-度量环比过来的数据
     * $rootScope.arDashboardFlag----在dashboard界面的标记
     * $rootScope.ratiosMetric----在visualize界面的标记
     */
    $rootScope.timeMetricRatiosFlag++;
    /**
     * 度量环比增长率--visualize
     * @type {boolean}
     */
    if (!$rootScope.arDashboardFlag && $rootScope.ratiosMetric) {
      let timeStart = constraints.max_value.gte;
      let timeStop = constraints.min_value.lte;
      constraints.max_value.gte = (timeStart - (timeStop - timeStart));
    }
    /**
     * 甘特图--visualize
     * @type {boolean}
     */
    if (!$rootScope.arDashboardFlag && $rootScope.arGantt) {//visualize
      timeField = [$rootScope.arGanttStartTime, $rootScope.arGanttEndTime, '@timestamp'];
      timeFieldObj = {
        [$rootScope.arGanttStartTime]: {
          'min_value': {
            'lte': constraints.min_value.lte,
            'format': constraints.min_value.format
          }
        },
        [$rootScope.arGanttEndTime]: {
          'max_value': {
            'gte': constraints.max_value.gte,
            'format': constraints.max_value.format
          }
        }
      };
    }


    if ($rootScope.arDashboardFlag) {
      /**
       * 度量环比增长率--dashboard
       * @type {boolean}
       */
      if ($rootScope.arMetricRatiosArr) {
        let ratiosArr = [];
        $rootScope.arMetricRatiosArr.map(function (itemRatios, indexRatios) {
          if (itemRatios.ratios) {
            ratiosArr.push(indexRatios);
          }
        });
        ratiosArr.map(function (arItem) {
          if ($rootScope.timeMetricRatiosFlag === arItem) {
            let timeStart = constraints.max_value.gte;
            let timeStop = constraints.min_value.lte;
            constraints.max_value.gte = (timeStart - (timeStop - timeStart));
          }
        });
      }
      /**
       * 甘特图--dashboard
       * @type {boolean}
       */
      if ($rootScope.arGanttDArr) {
        let ganttArr = [];
        $rootScope.arGanttDArr.map(function (itemRatios, indexRatios) {
          if (itemRatios.gantt) {
            ganttArr.push(indexRatios);
          }
        });
        ganttArr.map(function (arItem) {
          if ($rootScope.timeMetricRatiosFlag === arItem) {
            let startTime = $rootScope.arGanttDArr[arItem].startTime;
            let endTime = $rootScope.arGanttDArr[arItem].endTime;
            timeField = [startTime, endTime, '@timestamp'];
            timeFieldObj = {
              [startTime]: {
                'min_value': {
                  'lte': constraints.min_value.lte,
                  'format': constraints.min_value.format
                }
              },
              [endTime]: {
                'max_value': {
                  'gte': constraints.max_value.gte,
                  'format': constraints.max_value.format
                }
              }
            };
          }
        });
      }
    }


    return fieldStats(pattern);

    // return es.fieldStats({
    //   index: pattern,
    //   level: 'indices',
    //   body: {
    //     fields: timeField,
    //     index_constraints: timeFieldObj
    //   }
    // });
  }

  function sortIndexStats(indices, timeFieldName, sortDirection) {
    const desc = sortDirection === 'desc';
    const leader = desc ? 'max' : 'min';

    let indexDetails = _(indices).map((stats, index) => {
      const field = stats.fields[timeFieldName];
      return {
        index,
        min: field.min_value,
        max: field.max_value
      };
    });

    if (sortDirection) {
      indexDetails = indexDetails.sortByOrder([leader], [sortDirection]);
    }

    return indexDetails.value();
  }

  return calculateIndices;
};
