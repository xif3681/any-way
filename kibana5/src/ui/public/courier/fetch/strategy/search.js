import _ from 'lodash';
import angular from 'angular';

import {toJson} from 'ui/utils/aggressive_parse';
import _arSearch from './searchChange'

export default function FetchStrategyForSearch(Private, Promise, timefilter, kbnIndex, sessionId, $window, $rootScope,
                                               searchType, parameters) {
  let timeFieldName;
  let timeStart;
  let timeStop;
  let startEndTime = null;
  $rootScope.metricTimeRange = {};
  $rootScope.ganttTimeRange = {};
  /**
   * 度量环比增长率
   */
  //改变query参数设置
  function changeMetricQuery(bodyQuery) {
    let bodyQueryNeed = bodyQuery;
    for (let aggObj in bodyQueryNeed) {
      for (let aggObjChild in bodyQueryNeed[aggObj]) {
        if (aggObjChild === 'must') {
          let metricRangeObj = bodyQueryNeed[aggObj][aggObjChild];
          metricRangeObj.map(function (item, index) {
            if (item.range) {
              for (let aggObj in item.range) {
                timeStart = item.range[aggObj].gte;
                timeStop = item.range[aggObj].lte;
                item.range[aggObj].gte = (timeStart - (timeStop - timeStart));
                timeFieldName = aggObj;
                //将选定的时间区间保存在$rootScope.metricTimeRange里面，方便metric界面显示使用
                $rootScope.metricTimeRange = {
                  'start': timeStart,
                  'stop': timeStop,
                  'timeFieldName': timeFieldName
                };
              }
            }
          });
        }
      }
    }
    return bodyQueryNeed;
  };
  //改变Aggs参数设置
  function changeMetricAggs(bodyAggs) {
    let metricAggsNeed = {};
    metricAggsNeed['2'] = {
      date_range: {
        field: timeFieldName,
        format: 'epoch_millis',
        ranges: [
          {
            from: (timeStart - (timeStop - timeStart)) - 1,
            to: timeStart + 1
          },
          {
            from: timeStart - 1,
            to: timeStop + 1
          }
        ]
      }
    };
    metricAggsNeed['2'].aggs = bodyAggs;
    return metricAggsNeed;
  }

  /**
   * 甘特图
   */
  //改变query参数设置
  function changeGanttQuery(bodyQuery) {
    let bodyQueryNeed = bodyQuery;
    for (let aggObj in bodyQueryNeed) {
      for (let aggObjChild in bodyQueryNeed[aggObj]) {
        if (aggObjChild === 'must') {
          let ganttRangeObj = bodyQueryNeed[aggObj][aggObjChild];
          ganttRangeObj.map(function (item, index) {
            if (item.range) {
              for (let rangeTime in item.range) {
                let filter;
                let filter1;
                filter = {
                  range: {
                    [startEndTime.start_times]: {
                      lte: item.range[rangeTime].lte,
                      format: item.range[rangeTime].format
                    }
                  }
                };
                filter1 = {
                  range: {
                    [startEndTime.end_times]: {
                      gte: item.range[rangeTime].gte,
                      format: item.range[rangeTime].format
                    }
                  }
                };
                ganttRangeObj[index] = filter;
                ganttRangeObj[index + 1] = filter1;
                $rootScope.ganttTimeRange = {
                  'start': item.range[rangeTime].gte,
                  'stop': item.range[rangeTime].lte,
                };
              }

            }
          });
        }
      }
    }
    return bodyQueryNeed;
  };
  //改变Aggs参数设置
  function changeGanttAggs(bodyAggs) {
    let aggsNeed = null;
    for (let aggObj in bodyAggs) {
      for (let aggObjChild in bodyAggs[aggObj]) {
        if (aggObjChild === 'start_end_times') {
          startEndTime = bodyAggs[aggObj][aggObjChild];
        } else if (aggObjChild === 'aggs') {
          aggsNeed = bodyAggs[aggObj][aggObjChild];
        }
      }
    }
    //放置需要的数据格式
    if (!startEndTime.start_times && !startEndTime.end_times) {
      aggsNeed = {};
    } else if (aggsNeed !== undefined && startEndTime !== undefined) {
      for (let obj in aggsNeed) {
        if (aggsNeed[obj].terms.order._time) {
          aggsNeed[obj].terms.order = {
            _term: aggsNeed[obj].terms.order._time//时间序列
          };
        }
        if (!aggsNeed[obj].aggs) {
          aggsNeed[obj].aggs = {
            '2': {
              'terms': {'field': startEndTime.start_times, 'size': 10000, 'order': {'_term': 'asc'}},
              'aggs': {'3': {'terms': {'field': startEndTime.end_times, 'size': 10000}}}
            }
          };
        } else {
          aggsNeed[obj].aggs['2'] = {
            'terms': {'field': startEndTime.start_times, 'size': 10000, 'order': {'_term': 'asc'}},
            'aggs': {'3': {'terms': {'field': startEndTime.end_times, 'size': 10000}}}
          };
        }

      }
    }
    return aggsNeed;
  };
  return {
    clientMethod: 'msearch',

    /**
     * Flatten a series of requests into as ES request body
     *
     * @param  {array} requests - the requests to serialize
     * @return {Promise} - a promise that is fulfilled by the request body
     */

    reqsFetchParamsToBody: function (reqsFetchParams) {
      return Promise.map(reqsFetchParams, function (fetchParams) {
        return Promise.resolve(fetchParams.index)
          .then(function (indexList) {
            if (!_.isFunction(_.get(indexList, 'toIndexList'))) {
              return indexList;
            }

            const timeBounds = timefilter.getBounds();

            return indexList.toIndexList(timeBounds.min, timeBounds.max);
          })
          .then(function (indexList) {
            let body = fetchParams.body || {};

            // If we've reached this point and there are no indexes in the
            // index list at all, it means that we shouldn't expect any indexes
            // to contain the documents we're looking for, so we instead
            // perform a request for an index pattern that we know will always
            // return an empty result (ie. -*). If instead we had gone ahead
            // with an msearch without any index patterns, elasticsearch would
            // handle that request by querying *all* indexes, which is the
            // opposite of what we want in this case.
            /**
             * 用来检测当前是否为gantt过来的数据
             * @type {boolean}
             */
            for (let aggObj in body.aggs) {
              for (let aggObjChild in body.aggs[aggObj]) {
                if (aggObjChild === 'start_end_times') {
                  body.aggs = changeGanttAggs(body.aggs);
                  body.query = changeGanttQuery(body.query);
                }
              }
            }
            /**
             * 用来检测当前是否为度量，环比过来的数据
             * @type {boolean}
             */
            for (let aggObj in body.aggs) {
              if (aggObj === 'ratios') {
                delete body.aggs.ratios;
                body.query = changeMetricQuery(body.query);
                body.aggs = changeMetricAggs(body.aggs);
              }
            }


            if (_.isArray(indexList) && indexList.length === 0) {
              indexList.push(kbnIndex);
              body = emptySearch();
            }
            let indexs = indexList.join(';');
            //luo.chunxiang
            body.indexPattern = indexs;

            //将搜索body保存在localStorage里面
            window.localStorage.setItem('flatState_body', JSON.stringify(body));
            return toJson(body, angular.toJson);
            // return angular.toJson({
            //     index: indexList,
            //     type: fetchParams.type,
            //     search_type: fetchParams.search_type,
            //     ignore_unavailable: true,
            //     preference: sessionId,
            //   })
            //   + '\n'
            //   + toJson(body, angular.toJson);
          });
      })
        .then(function (requests) {
          /*
           2017.4.20
           by luo.chunxiang
           anyrobot-search
           */

          parameters = [{
            'logGroup': 'logstash-*',
            'timeRange': [1492531200000, 1492617599999],
            'filterField': {'must': [], 'must_not': []},
            'query': '* | bucket datehistorgram(@timestamp) interval=3h timezone=\"Asia/Shanghai\" mindoccount=1 as 2',
            'sort': [{'@timestamp': 'desc'}],
            'page': 0,
            'size': 500,
            'resultFilters': [],
            'includeSource': 1,
            'dsl': {}
          }];

          requests.map((obj, i)=> {
            let para = JSON.parse(obj);
            let must = para.query.bool.must;
            let mustNot = para.query.bool.must_not;
            let len = must.length;

            if (!parameters[i]) {
              parameters[i] = {
                'logGroup': 'logstash-*',
                'timeRange': [1492531200000, 1492617599999],
                'filterField': {'must': [], 'must_not': []},
                'query': '',
                'sort': [{'@timestamp': 'desc'}],
                'page': 0,
                'size': 500,
                'resultFilters': [],
                'includeSource': 1,
                'dsl': {}
              };
            }

            //logGroup
            if (para.indexPattern) {
              parameters[i].logGroup = para.indexPattern;
            }


            //size
            if (para.size) {
              parameters[i].size = para.size;
            }


            //sort
            if (para.sort) {
              para.sort.map((obj, j) => {
                parameters[i].sort[j] = {};
                for (let key in obj) {
                  if (obj.hasOwnProperty(key)) {
                    parameters[i].sort[j][key] = obj[key].order;
                  }
                }
              });
            }

            //filterField must
            let ganttFlag = 0;
            let fields = ['@timestamp'];
            let index_constraints = {};
            must.map((obj, j) => {
              for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                  //filterField must
                  if (key === 'match') {
                    for (let key1 in obj[key]) {
                      if (obj[key].hasOwnProperty(key1)) {
                        //parameters[i].filterField.must[key1] = obj[key][key1].query;
                        let mustObj = {};
                        mustObj[key1] = obj[key][key1].query;
                        parameters[i].filterField.must.push(mustObj);
                      }
                    }

                  }


                  ////timeRange
                  if (key === 'range') {
                    let range = obj[key];
                    for (let key in range) {
                      if (range.hasOwnProperty(key)) {
                        fields.push(key);
                        if (range[key].gte) {
                          index_constraints[key] = {
                            'max_value': {
                              'gte': range[key].gte,
                              'format': 'epoch_millis'
                            }
                          };
                          parameters[i].timeRange[0] = range[key].gte;
                        }
                        if (range[key].lte) {
                          index_constraints[key] = {
                            'min_value': {
                              'lte': range[key].lte,
                              'format': 'epoch_millis'
                            }
                          };
                          parameters[i].timeRange[1] = range[key].lte;
                        }

                      }
                    }
                    ganttFlag++;//甘特图有两个range
                    if (ganttFlag === 2) {
                      parameters[i].timeRange = {
                        'fields': fields,
                        'index_constraints': index_constraints
                      };
                    }
                  }
                }
              }
            });

            //filterField must_not
            mustNot.map((obj, j) => {
              for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                  if (key === 'match') {
                    for (let key1 in obj[key]) {
                      if (obj[key].hasOwnProperty(key1)) {
                        //parameters[i].filterField.must_not[key1] = obj[key][key1].query;
                        let mustNotObj = {};
                        mustNotObj[key1] = obj[key][key1].query;
                        parameters[i].filterField.must_not.push(mustNotObj);
                      }
                    }

                  }
                }
              }
            });


            if (searchType.type === 'dashboard' || searchType.type === 'visualize') {
              //dsl
              let dsl = para;
              for (let key in dsl) {
                if (dsl.hasOwnProperty(key)) {
                  if (key === 'indexPattern') {
                    delete dsl[key];
                  }
                }
              }
              //query
              must.map((obj, j) => {
                for (let key in obj) {
                  if (obj.hasOwnProperty(key)) {
                    if (key === 'query_string') {
                      parameters[i].query = obj[key].query;
                    }
                  }
                }
              });
              /**
               * 用来检测当前是否为状态监控过来的数据
               * @type {boolean}
               */
              for (let aggObj in dsl.aggs) {
                for (let aggObjChild in dsl.aggs[aggObj]) {
                  if (aggObjChild === 'monitor_another') {
                    let monitorBody = _arSearch.changeMonitorQuery(dsl, dsl.aggs[aggObj].aggs);
                    dsl = monitorBody;
                  }
                }
              }
              parameters[i].dsl = dsl;
            } else if (searchType.type === 'search') {
              //query
              let aggs = para.aggs;
              let interval;
              for (let key in aggs) {
                if (obj.hasOwnProperty(key)) {
                  if (key === '2') {
                    interval = aggs[key].date_histogram.interval;
                  }
                }
              }

              let queryM = `| bucket datehistorgram(@timestamp) interval=${interval} timezone=\"Asia/Shanghai\" mindoccount=1 as 2`;
              must.map((obj, j) => {
                for (let key in obj) {
                  if (obj.hasOwnProperty(key)) {
                    if (key === 'query_string') {
                      parameters[i].query = `${obj[key].query} ${queryM}`;
                    }
                  }
                }
              });
            }

          });

          return {
            'arSearchBody': parameters,
            'requestsBody': requests.join('\n') + '\n'
          };
          //return requests.toString() + '\n';
          return requests.join('\n') + '\n';
        });

    },

    /**
     * Fetch the multiple responses from the ES Response
     * @param  {object} resp - The response sent from Elasticsearch
     * @return {array} - the list of responses
     */
    getResponses: function (resp) {
      return resp.responses;
    }
  };
};

function emptySearch() {
  return {
    query: {
      bool: {
        must_not: [
          {match_all: {}}
        ]
      }
    }
  };
}
