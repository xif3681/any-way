import _ from 'lodash';
import $ from 'jquery';
import angular from 'angular';
import moment from 'moment';
import getSort from 'ui/doc_table/lib/get_sort';
import dateMath from '@elastic/datemath';
import 'ui/doc_table';
import 'ui/visualize';
import 'ui/notify';
import 'ui/fixed_scroll';
import 'ui/directives/validate_json';
import 'ui/filters/moment';
import 'ui/courier';
import 'ui/index_patterns';
import 'ui/state_management/app_state';
import 'ui/timefilter';
import 'ui/highlight/highlight_tags';
import 'ui/share';
import 'ui/angular-bootstrap';
import VisProvider from 'ui/vis';
import DocTitleProvider from 'ui/doc_title';
import UtilsBrushEventProvider from 'ui/utils/brush_event';
import PluginsKibanaDiscoverHitSortFnProvider from 'plugins/kibana/discover/_hit_sort_fn';
import FilterBarQueryFilterProvider from 'ui/filter_bar/query_filter';
import FilterManagerProvider from 'ui/filter_manager';
import AggTypesBucketsIntervalOptionsProvider from 'ui/agg_types/buckets/_interval_options';
import stateMonitorFactory  from 'ui/state_management/state_monitor_factory';
import uiRoutes from 'ui/routes';
import uiModules from 'ui/modules';
import indexTemplate from 'plugins/kibana/discover/index.html';
import StateProvider from 'ui/state_management/state';
import __ from 'plugins/kibana/discover/components/locale/locale.js';
const app = uiModules.get('apps/discover', [
  'ui.bootstrap',
  'ui.bootstrap.accordion',
  'kibana/notify',
  'kibana/courier',
  'kibana/index_patterns'
]);

uiRoutes
  .defaults(/discover/, {
    requireDefaultIndex: true
  })
  .when('/discover/:id?', {
    template: indexTemplate,
    reloadOnSearch: false,
    resolve: {
      ip: function (Promise, courier, config, $location, Private) {
        const State = Private(StateProvider);
        return courier.indexPatterns.getIds()
          .then(function (list) {
            /**
             *  In making the indexPattern modifiable it was placed in appState. Unfortunately,
             *  the load order of AppState conflicts with the load order of many other things
             *  so in order to get the name of the index we should use, and to switch to the
             *  default if necessary, we parse the appState with a temporary State object and
             *  then destroy it immediatly after we're done
             *
             *  @type {State}
             */
            const state = new State('_a', {});

            const specified = !!state.index;
            const exists = _.contains(list, state.index);
            const id = exists ? state.index : config.get('defaultIndex');
            state.destroy();

            return Promise.props({
              list: list,
              loaded: courier.indexPatterns.get(id),
              stateVal: state.index,
              stateValFound: specified && exists
            });
          });
      },
      savedSearch: function (courier, savedSearches, $route) {
        return savedSearches.get($route.current.params.id)
          .catch(courier.redirectWhenMissing({
            'search': '/discover',
            'index-pattern': '/management/kibana/objects/savedSearches/' + $route.current.params.id
          }));
      }
    }
  });

app.directive('discoverApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'discoverApp',
    controller: discoverController
  };
});


function discoverController($scope, config, courier, $route, $window, Notifier,
                            AppState, timefilter, Promise, Private, kbnUrl, highlightTags, $translate, $translatePartialLoader,
                            T, $modal, parameters, searchType, $location,getPathInfo,locals) {
  //luo.chunxiang@eisoo.com
  $translatePartialLoader.addPart('../plugins/kibana/discover');
  $translate.refresh();
  const Vis = Private(VisProvider);
  const docTitle = Private(DocTitleProvider);
  const brushEvent = Private(UtilsBrushEventProvider);
  const HitSortFn = Private(PluginsKibanaDiscoverHitSortFnProvider);
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const filterManager = Private(FilterManagerProvider);

  var discovers = $translate.instant('Discover');
  const notify = new Notifier({
    location: discovers
  });
  //luo.chunxoang@eisoo.com

  var NameThisSearch;
  var UsingTheDefaultIndexPattern;
  var isNotConfiguredPattern;
  var UsingTheSavedIndexPattern;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    NameThisSearch = '将此搜索命名为...';
    $scope.hitAr = '事件总数';
    $scope.hitsAr = '事件总数';
  } else if (lang === 'zh-tw') {
    NameThisSearch = '將此搜索命名為...';
    $scope.hitAr = '事件總數';
    $scope.hitsAr = '事件總數';
  } else {
    NameThisSearch = 'Name this search...';
    $scope.hitAr = 'hit';
    $scope.hitsAr = 'hits';
  }
  $scope.lang = lang;


  $scope.intervalOptions = Private(AggTypesBucketsIntervalOptionsProvider);
  $scope.showInterval = false;

  $scope.intervalEnabled = function (interval) {
    return interval.val !== 'custom';
  };

  $scope.toggleInterval = function () {
    $scope.showInterval = !$scope.showInterval;
  };
  $scope.topNavMenu = [{
    key: 'new',
    description: 'New Search',
    run: function () {
      kbnUrl.change('/discover');
    }
  }, {
    key: 'save',
    description: 'Save Search',
    template: require('plugins/kibana/discover/partials/save_search.html')
  }, {
    key: 'open',
    description: 'Load Saved Search',
    template: require('plugins/kibana/discover/partials/load_search.html')
  }, {
    key: 'share',
    description: 'Share Search',
    template: require('plugins/kibana/discover/partials/share_search.html')
  }];
  $scope.timefilter = timefilter;


  // the saved savedSearch
  const savedSearch = $route.current.locals.savedSearch;
  savedSearch.NameThisSearch = NameThisSearch;
  $scope.$on('$destroy', savedSearch.destroy);

  // the actual courier.SearchSource
  $scope.searchSource = savedSearch.searchSource;
  $scope.indexPattern = resolveIndexPatternLoading();
  $scope.searchSource.set('index', $scope.indexPattern);

  if (savedSearch.id) {
    docTitle.change(savedSearch.title);
  }

  let stateMonitor;
  const $appStatus = $scope.appStatus = this.appStatus = {};
  const $state = $scope.state = new AppState(getStateDefaults());
  $scope.uiState = $state.makeStateful('uiState');

  function getStateDefaults() {
    return {
      query: $scope.searchSource.get('query') || '',
      sort: getSort.array(savedSearch.sort, $scope.indexPattern),
      columns: savedSearch.columns.length > 0 ? savedSearch.columns : config.get('defaultColumns'),
      index: $scope.indexPattern.id,
      interval: 'auto',
      filters: _.cloneDeep($scope.searchSource.getOwn('filter'))
    };
  }

  $state.index = $scope.indexPattern.id;
  $state.sort = getSort.array($state.sort, $scope.indexPattern);

  $scope.$watchCollection('state.columns', function () {
    $state.save();
  });

  $scope.opts = {
    // number of records to fetch, then paginate through
    sampleSize: config.get('discover:sampleSize'),
    // Index to match
    index: $scope.indexPattern.id,
    timefield: $scope.indexPattern.timeFieldName,
    savedSearch: savedSearch,
    indexPatternList: $route.current.locals.ip.list,
    timefilter: $scope.timefilter
  };

  const init = _.once(function () {
    const showTotal = 5;
    $scope.failuresShown = showTotal;
    $scope.showAllFailures = function () {
      $scope.failuresShown = $scope.failures.length;
    };
    $scope.showLessFailures = function () {
      $scope.failuresShown = showTotal;
    };

    stateMonitor = stateMonitorFactory.create($state, getStateDefaults());
    stateMonitor.onChange((status) => {
      $appStatus.dirty = status.dirty;
    });
    $scope.$on('$destroy', () => stateMonitor.destroy());

    $scope.updateDataSource()
      .then(function () {
        $scope.$listen(timefilter, 'fetch', function () {
          $scope.fetch();
        });

        $scope.$watchCollection('state.sort', function (sort) {
          if (!sort) return;

          // get the current sort from {key: val} to ["key", "val"];
          const currentSort = _.pairs($scope.searchSource.get('sort')).pop();

          // if the searchSource doesn't know, tell it so
          if (!angular.equals(sort, currentSort)) $scope.fetch();
        });

        // update data source when filters update
        $scope.$listen(queryFilter, 'update', function () {
          return $scope.updateDataSource().then(function () {
            $state.save();
          });
        });

        // update data source when hitting forward/back and the query changes
        $scope.$listen($state, 'fetch_with_changes', function (diff) {
          if (diff.indexOf('query') >= 0) $scope.fetch();
        });

        // fetch data when filters fire fetch event
        $scope.$listen(queryFilter, 'fetch', $scope.fetch);

        $scope.$watch('opts.timefield', function (timefield) {
          timefilter.enabled = !!timefield;
        });

        $scope.$watch('state.interval', function (interval, oldInterval) {
          if (interval !== oldInterval && interval === 'auto') {
            $scope.showInterval = false;
          }
          $scope.fetch();
        });

        var findTimes = function (times) {
          var time = times;
          if (time) {
            if (times.indexOf('milliseconds') > -1 || times.indexOf('seconds') > -1 ||
              times.indexOf('minutes') > -1 || times.indexOf('hours') > -1) {
              var arr = times.split(' ');
              var num = arr[0];
              var str = $translate.instant(arr[1]);
              time = num + str;
            } else {
              time = $translate.instant(times);
            }
          }

          return time;
        };

        $scope.$watch('vis.aggs', function () {
          // no timefield, no vis, nothing to update
          if (!$scope.opts.timefield) return;

          const buckets = $scope.vis.aggs.bySchemaGroup.buckets;

          if (buckets && buckets.length === 1) {
            $scope.intervalName = $translate.instant('by') + findTimes(buckets[0].buckets.getInterval().description);

          } else {
            $scope.intervalName = 'auto';
          }
        });

        $scope.$watchMulti([
          'rows',
          'fetchStatus'
        ], (function updateResultState() {
          let prev = {};
          const status = {
            LOADING: 'loading', // initial data load
            READY: 'ready', // results came back
            NO_RESULTS: 'none' // no results came back
          };

          function pick(rows, oldRows, fetchStatus) {
            // initial state, pretend we are loading
            if (rows == null && oldRows == null) return status.LOADING;

            const rowsEmpty = _.isEmpty(rows);
            // An undefined fetchStatus means the requests are still being
            // prepared to be sent. When all requests are completed,
            // fetchStatus is set to null, so it's important that we
            // specifically check for undefined to determine a loading status.
            const preparingForFetch = _.isUndefined(fetchStatus);
            if (preparingForFetch) return status.LOADING;
            else if (rowsEmpty && fetchStatus) return status.LOADING;
            else if (!rowsEmpty) return status.READY;
            else return status.NO_RESULTS;
          }

          return function () {
            const current = {
              rows: $scope.rows,
              fetchStatus: $scope.fetchStatus
            };

            $scope.resultState = pick(
              current.rows,
              prev.rows,
              current.fetchStatus,
              prev.fetchStatus
            );

            prev = current;
          };
        }()));

        $scope.searchSource.onError(function (err) {
          notify.error(err);
        }).catch(notify.fatal);

        function initForTime() {
          return setupVisualization().then($scope.updateTime);
        }

        return Promise.resolve($scope.opts.timefield && initForTime())
          .then(function () {
            init.complete = true;
            $state.replace();
            $scope.$emit('application.load');
          });
      });
  });

  $scope.opts.saveDataSource = function () {
    return $scope.updateDataSource()
      .then(function () {
        savedSearch.id = savedSearch.title;
        savedSearch.columns = $scope.state.columns;
        savedSearch.sort = $scope.state.sort;

        return savedSearch.save()
          .then(function (id) {
            stateMonitor.setInitialState($state.toJSON());
            $scope.kbnTopNav.close('save');

            if (id) {
              notify.info(`${$translate.instant('Saved Data Source')} ${savedSearch.title}`);
              if (savedSearch.id !== $route.current.params.id) {
                kbnUrl.change('/discover/{{id}}', {id: savedSearch.id});
              } else {
                // Update defaults so that "reload saved query" functions correctly
                $state.setDefaults(getStateDefaults());
              }
            }
          });
      })
      .catch(notify.error);
  };
  //防止用户不停的点击搜索按钮,添加_.debounce tyf
  $scope.opts.fetch = $scope.fetch = _.debounce(function () {
    if (!window.httpActive.length) {
      // ignore requests to fetch before the app inits
      if (!init.complete) return;

      $scope.updateTime();

      $scope.updateDataSource()
        .then(setupVisualization)
        .then(function () {
          $state.save();
          return courier.fetch();
        })
        .catch(notify.error);
    } else {
      //console.log('正在处理请求中');
    }

  }, 1000);
  // $scope.opts.fetch = $scope.fetch = function () {
  //   // ignore requests to fetch before the app inits
  //   if (!init.complete) return;
  //
  //   $scope.updateTime();
  //
  //   $scope.updateDataSource()
  //   .then(setupVisualization)
  //   .then(function () {
  //     $state.save();
  //     return courier.fetch();
  //   })
  //   .catch(notify.error);
  // };
  //
  //
  //
  //
  //
  //
  console.log($scope.state)
  console.log($scope.filterQuery)
  /**
   * 日志分组
   */
  //存储当前节点，刷新是展示
  //存储当前节点，刷新是展示
  $scope.storageNodeIime = function () {
    let childNode = {
      id:$scope.seletedNode.groupId,
      name:$scope.seletedNode.name,
      pathInfo:$scope.currentNode.pathInfo
    };

    locals.setObject('disLogTree',childNode);
  };

   //获取本地存储的信息
  let childNode = locals.getObject('disLogTree', '');


  $scope.seletedNode = {};
  $scope.currentNode = {};
  $scope.currentNode.pathInfo = childNode.pathInfo || '所有日志';
  $scope.indexPatternName = childNode.name || '所有日志';
  $scope.disLogTree = 'disLogTree';

  $scope.treeClick = function (event, treeId, treeNode, clickFlag) {
    $scope.treeNode = treeNode;
    if ($scope.seletedNode) {
      if ($scope.seletedNode.groupId === treeNode.groupId) {
        return;
      }

    }
    $scope.seletedNode = treeNode;
    $scope.indexPatternName = treeNode.name;
    $scope.showTree = false;
    getPathInfo(treeNode.groupId,$scope.currentNode);
    $scope.storageNodeIime();

  };
  $scope.treeMethod = {
    treeClick: $scope.treeClick
  };


  $scope.showTree = false;
  $scope.showTheTree = function () {
    if ($scope.showTree === false) {
      $scope.showTree = true;
    } else {
      $scope.showTree = false;
    }

  };





  /**
   * 分页功能
   * @type {{settingConf: {currentPage: number, itemsPerPage: number, totalItems: number, perPageOptions: number[]}}}
   */
  //配置分页基本参数
  $scope.discover = {
    settingConf: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      perPageOptions: [10, 20, 50]
    }
  };
  function getDiscoverSetting() {
    let sortStart = $scope.discover.settingConf.itemsPerPage * ($scope.discover.settingConf.currentPage - 1);
    let sortEnd = $scope.discover.settingConf.itemsPerPage * $scope.discover.settingConf.currentPage;

    if ($scope.all !== undefined) {
      $scope.arRows = $scope.all.slice(sortStart, sortEnd);
    }

  }

  $scope.$watch('discover.settingConf.currentPage + discover.settingConf.itemsPerPage', getDiscoverSetting);

  $scope.searchSource.onBeginSegmentedFetch(function (segmented) {

    function flushResponseData() {
      $scope.hits = 0;
      $scope.faliures = [];
      $scope.rows = [];
      $scope.fieldCounts = {};
    }

    if (!$scope.rows) flushResponseData();

    const sort = $state.sort;
    const timeField = $scope.indexPattern.timeFieldName;
    const totalSize = $scope.size || $scope.opts.sampleSize;

    /**
     * Basically an emum.
     *
     * opts:
     *   "time" - sorted by the timefield
     *   "non-time" - explicitly sorted by a non-time field, NOT THE SAME AS `sortBy !== "time"`
     *   "implicit" - no sorting set, NOT THE SAME AS "non-time"
     *
     * @type {String}
     */
    const sortBy = (function () {
      if (!_.isArray(sort)) return 'implicit';
      else if (sort[0] === '_score') return 'implicit';
      else if (sort[0] === timeField) return 'time';
      else return 'non-time';
    }());

    let sortFn = null;
    if (sortBy !== 'implicit') {
      sortFn = new HitSortFn(sort[1]);
    }

    $scope.updateTime();
    if (sort[0] === '_score') segmented.setMaxSegments(1);
    segmented.setDirection(sortBy === 'time' ? (sort[1] || 'desc') : 'desc');
    segmented.setSortFn(sortFn);
    segmented.setSize($scope.opts.sampleSize);

    // triggered when the status updated
    segmented.on('status', function (status) {
      $scope.fetchStatus = status;
    });

    segmented.on('first', function () {
      flushResponseData();
    });

    segmented.on('segment', notify.timed('handle each segment', function (resp) {
      if (resp._shards.failed > 0) {
        $scope.failures = _.union($scope.failures, resp._shards.failures);
        $scope.failures = _.uniq($scope.failures, false, function (failure) {
          return failure.index + failure.shard + failure.reason;
        });
      }
    }));

    segmented.on('mergedSegment', function (merged) {
      $scope.mergedEsResp = merged;
      $scope.hits = merged.hits.total;

      const indexPattern = $scope.searchSource.get('index');

      // the merge rows, use a new array to help watchers
      $scope.rows = merged.hits.hits.slice();
      /**
       * 分页
       */
      $scope.all = merged.hits.hits.slice();
      $scope.discover.settingConf.totalItems = $scope.all.length;
      getDiscoverSetting();

      notify.event('flatten hit and count fields', function () {
        let counts = $scope.fieldCounts;

        // if we haven't counted yet, or need a fresh count because we are sorting, reset the counts
        if (!counts || sortFn) counts = $scope.fieldCounts = {};

        $scope.rows.forEach(function (hit) {
          // skip this work if we have already done it
          if (hit.$$_counted) return;

          // when we are sorting results, we need to redo the counts each time because the
          // "top 500" may change with each response, so don't mark this as counted
          if (!sortFn) hit.$$_counted = true;

          const fields = _.keys(indexPattern.flattenHit(hit));
          let n = fields.length;
          let field;
          while (field = fields[--n]) {
            if (counts[field]) counts[field] += 1;
            else counts[field] = 1;
          }
        });
      });
    });

    segmented.on('complete', function () {
      if ($scope.fetchStatus.hitCount === 0) {
        flushResponseData();
      }

      $scope.fetchStatus = null;
    });
  }).catch(notify.fatal);

  $scope.updateTime = function () {
    $scope.timeRange = {
      from: dateMath.parse(timefilter.time.from),
      to: dateMath.parse(timefilter.time.to, true)
    };
  };

  $scope.resetQuery = function () {
    kbnUrl.change('/discover/{{id}}', {id: $route.current.params.id});
  };

  $scope.newQuery = function () {
    kbnUrl.change('/discover');
  };
  /**
   * 状态监控跳转
   * @type {null}
   */
  if ($location.hash() === 'monitor') {
    $state.query = $location.search().url;
  }
  $scope.updateDataSource = Promise.method(function () {
    $scope.searchSource
      .size($scope.opts.sampleSize)
      .sort(getSort($state.sort, $scope.indexPattern))
      .query(!$state.query ? null : $state.query)
      .set('filter', queryFilter.getFilters());

    if (config.get('doc_table:highlight')) {
      $scope.searchSource.highlight({
        pre_tags: [highlightTags.pre],
        post_tags: [highlightTags.post],
        fields: {'*': {}},
        require_field_match: false,
        fragment_size: 2147483647 // Limit of an integer.
      });
    }
  });

  // TODO: On array fields, negating does not negate the combination, rather all terms
  $scope.filterQuery = function (field, values, operation) {
    $scope.indexPattern.popularizeField(field, 1);
    filterManager.add(field, values, operation, $state.index);
  };

  $scope.toTop = function () {
    $window.scrollTo(0, 0);
  };

  let loadingVis;

  function setupVisualization() {
    // If we're not setting anything up we need to return an empty promise
    if (!$scope.opts.timefield) return Promise.resolve();
    if (loadingVis) return loadingVis;

    const visStateAggs = [
      {
        type: 'count',
        schema: 'metric'
      },
      {
        type: 'date_histogram',
        schema: 'segment',
        params: {
          field: $scope.opts.timefield,
          interval: $state.interval
        }
      }
    ];

    // we have a vis, just modify the aggs
    if ($scope.vis) {
      const visState = $scope.vis.getEnabledState();
      visState.aggs = visStateAggs;

      $scope.vis.setState(visState);
      return Promise.resolve($scope.vis);
    }

    $scope.vis = new Vis($scope.indexPattern, {
      title: savedSearch.title,
      type: 'histogram',
      params: {
        addLegend: false,
        addTimeMarker: true
      },
      listeners: {
        click: function (e) {
          notify.log(e);
          timefilter.time.from = moment(e.point.x);
          timefilter.time.to = moment(e.point.x + e.data.ordered.interval);
          timefilter.time.mode = 'absolute';
        },
        brush: brushEvent
      },
      aggs: visStateAggs
    });

    $scope.searchSource.aggs(function () {
      $scope.vis.requesting();
      return $scope.vis.aggs.toDsl();
    });

    // stash this promise so that other calls to setupVisualization will have to wait
    loadingVis = new Promise(function (resolve) {
      $scope.$on('ready:vis', function () {
        resolve($scope.vis);
      });
    })
      .finally(function () {
        // clear the loading flag
        loadingVis = null;
      });

    return loadingVis;
  }

  function resolveIndexPatternLoading() {
    const props = $route.current.locals.ip;
    const loaded = props.loaded;
    const stateVal = props.stateVal;
    const stateValFound = props.stateValFound;

    const own = $scope.searchSource.getOwn('index');

    if (own && !stateVal) return own;
    if (stateVal && !stateValFound) {
      const err = '"' + stateVal + '" is not a configured pattern. ';
      if (own) {
        notify.warning(err + ' Using the saved index pattern: "' + own.id + '"');
        return own;
      }

      notify.warning(err + ' Using the default index pattern: "' + loaded.id + '"');
    }
    return loaded;
  }

  /*
   AR-194搜索tab项原始日志展示 开始
   by luo.chunxiang
   2017.03.14
   */
  $scope.displayMode = __.displayMode;//展示列表
  $scope.downloadMode = __.downloadMode;//下载列表
  // $scope.displayModeInit = 'ListMode';
  // $scope.displayModeChange = function (displayModeInit) {
  //   $scope.displayModeInit = displayModeInit;
  // };

  //1.展示
  $scope.displayModeInit = $scope.displayMode[0].value;
  $scope.displayModeInitId = 'ListMode';
  $scope.setMode = function (index) {
    $scope.displayModeInit = $scope.displayMode[index].value;
    $scope.displayModeInitId = $scope.displayMode[index].id;

  };

  //2.下载
  $scope.modal = function (index, id) {
    if (id === 'info') {
      $modal.open({
        controller: 'downModalInfoCtrl as downInfo',
        templateUrl: 'downloadInfo.html',
        windowClass: 'arDownModal',// 自定义modal上级div的class
        size: 'sm', //大小配置
        resolve: {
          logtype: function () {
            return $scope.downloadMode[index].id;
          },
          columns: function () {
            return $scope.state.columns;
          },
          hits: function () {
            return $scope.hits;
          }
        }
      });
    } else {
      $modal.open({
        controller: 'downModalCtrl as down',
        templateUrl: 'download.html',
        windowClass: 'edModal',// 自定义modal上级div的class
        size: 'sm', //大小配置
        resolve: {
          logtype: function () {
            return $scope.downloadMode[index].id;
          },
          columns: function () {
            return $scope.state.columns;
          },
          hits: function () {
            return $scope.hits;
          }
        }
      });
    }

  };

  /*
   AR-194搜索tab项原始日志展示 结束
   by luo.chunxiang
   2017.03.14
   */

  /*
   anyrobot-search
   by luo.chunxiang
   2017.04.19
   */
  //1.存储索引


  parameters[0].logGroup = $state.index;
  searchType.type = 'search';


  init();
};

app
  .controller('downModalCtrl', function ($modalInstance, $scope, $timeout, $interval, $http, logtype, $cookieStore,
                                         columns, $window, $translate, Notifier, hits) {

    /**
     * 下载日志弹框
     */
    var discovers = $translate.instant('Discover');
    const notify = new Notifier({
      location: discovers
    });
    let date = new Date().getTime();

    //将保存在localStorage里面搜索body,indexs
    $scope.hits = hits;
    let size = hits;
    let body = JSON.parse(window.localStorage.getItem('flatState_body'));
    let statusIndexs = window.localStorage.getItem('statuses_indexs');
    let userId = JSON.parse($cookieStore.get('currentUserApp')).userId;
    body.size = size;
    $scope.filename = '';
    this.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    // 取消按钮
    let cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.cancel = cancel;

    //点击确定按钮
    $scope.confirm = function (argument) {
      let filename = $scope.filename === '' || $scope.filename === undefined ? date : $scope.filename;
      let fields = logtype === 'origin' ? [] : columns;
      let TimezoneOffset = new Date().getTimezoneOffset();
      let timezone = -(TimezoneOffset / 60);
      let downAgrs = {
        'indexs': statusIndexs.split(';'),
        'query': body,
        'filename': filename,
        'logtype': logtype,
        'fields': fields,
        'user': userId,
        'timezone': timezone//时区信息
      };
      //502错误处理
      let handleError = function (res, status) {
        if (status === 502) {
          $scope.errorMessge = '服务异常！';
        } else {
          $scope.errorMessge = res.message;//后台错误
        }
      };
      let url = '/manager/export';
      $scope.nowDownloading = [];
      $http.post(url, downAgrs).success(function (res, status) {
        if (status === 200) {
          // $scope.nowDownloading.push(res);
          // notify.info($translate.instant('正在获取数据'));
        } else if (status === 202) {
          let err = $translate.instant(`${res.code}export`);
          notify.error(err);
        }
      }).error(function (res, status) {
        handleError(res, status);
      });
      cancel();
    };
  })
  .controller('downModalInfoCtrl', function ($modalInstance, $scope, $timeout, $http, $interval, logtype,
                                             columns, $window, $translate, Notifier, hits, $cookieStore) {
    /**
     * 离线下载日志弹框
     * @type {any}
     */
    var discovers = $translate.instant('Discover');
    const notify = new Notifier({
      location: discovers
    });
    //界面点击下载，已完成切换
    $scope.downloadTable = true;
    $scope.downloadToggle = function () {
      $scope.downloadTable = !$scope.downloadTable;
    };
    //502错误处理
    let handleError = function (res, status) {
      if (status === 502) {
        $scope.errorMessge = '服务异常！';
      } else {
        $scope.errorMessge = res.message;//后台错误
      }
    };
    //获取用户ID
    let userId = JSON.parse($cookieStore.get('currentUserApp')).userId;
    //获取列表信息
    let getExportAll = function () {
      //获取正在下载和已完成列表
      $scope.downItems = [];
      $scope.complateItems = [];
      $http.get(`/manager/export/${userId}/all`).success(function (res, status) {
        if (status === 200) {
          res.map(function (obj) {
            if (obj.status === 1) {
              $scope.complateItems.push(obj);
            } else {
              $scope.downItems.push(obj);
            }
          });
          //若正在下载没有，默认展开<已完成>面板
          if (!$scope.downItems.length) {
            $scope.downloadTable = false;
          }
          //若正在下载和已完成任务都没有，默认展开<正在下载>面板
          if (!$scope.downItems.length && !$scope.complateItems.length) {
            $scope.downloadTable = true;
          }
          // notify.info($translate.instant('成功获取所有任务'));
        } else if (status === 202) {
          let err = $translate.instant(`${res.code}export`);
          notify.error(err);
        }
      }).error(function (res, status) {
        handleError(res, status);
      });
    };
    getExportAll();
    //实时获取进度
    let loopExportAll = $interval(function () {
      getExportAll();
    }, 10000);
    $scope.$on('$destroy', function () {
      $interval.cancel(loopExportAll);
    });
    /**
     * 删除文件
     * @param downItem
     * @param index
     */
    $scope.delFile = function (downItem, index) {
      $http.delete(`/manager/export/${userId}/remove/${downItem.Id}`).success(function (res, status) {
        if (status === 200) {
          $scope.downItems.splice(index, 1);
          // notify.info($translate.instant('数据删除成功'));
        } else if (status === 202) {
          let err = $translate.instant(`${res.code}export`);
          notify.error(err);
        }
      }).error(function (res, status) {
        handleError(res, status);
      });

    };
    /**
     * 一键删除
     */
    $scope.delAllFile = function () {
      $http.delete(`/manager/export/${userId}/remove_all/process`).success(function (res, status) {
        if (status === 200) {
          $scope.downItems = [];
          // notify.info($translate.instant('全部数据删除成功'));
        } else if (status === 202) {
          let err = $translate.instant(`${res.code}export`);
          notify.error(err);
        }
      }).error(function (res, status) {
        handleError(res, status);
      });
    };
    /**
     * 暂停下载
     */
    $scope.pauseFile = function (downItem, index) {
      if (downItem.status === 0) {
        $http.put(`/manager/export/${userId}/pause/${downItem.Id}`).success(function (res, status) {
          if (status === 200) {
            downItem.status = 2;
            // notify.info($translate.instant('数据暂停成功'));
          } else if (status === 202) {
            let err = $translate.instant(`${res.code}export`);
            notify.error(err);

          }
        }).error(function (res, status) {
          handleError(res, status);
        });
      } else if (downItem.status === 2) {
        $http.put(`/manager/export/${userId}/continue/${downItem.Id}`).success(function (res, status) {
          if (status === 200) {
            downItem.status = 0;
            // notify.info($translate.instant('数据开始成功'));
          } else if (status === 202) {
            let err = $translate.instant(`${res.code}export`);
            notify.error(err);
          }
        }).error(function (res, status) {
          handleError(res, status);
        });
      }
    };
    /**
     * 一键暂停,启动
     */
    $scope.pauseOrStart = {
      id: 'pause',
      name: '一键暂停'
    };
    $scope.pauseStartAllFile = function (id) {
      if (id === 'pause') {
        $http.put(`/manager/export/${userId}/pause_all`).success(function (res, status) {
          if (status === 200) {
            // notify.info($translate.instant('全部数据暂停成功'));
            getExportAll();
            $scope.pauseOrStart = {
              id: 'start',
              name: '一键启动'
            };
          } else if (status === 202) {
            let err = $translate.instant(`${res.code}export`);
            notify.error(err);
          }
        }).error(function (res, status) {
          handleError(res, status);
        });
      } else {
        $http.put(`/manager/export/${userId}/continue_all`).success(function (res, status) {
          if (status === 200) {
            // notify.info($translate.instant('全部数据开启成功'));
            getExportAll();
            $scope.pauseOrStart = {
              id: 'pause',
              name: '一键暂停'
            };
          } else if (status === 202) {
            let err = $translate.instant(`${res.code}export`);
            notify.error(err);
          }
        }).error(function (res, status) {
          handleError(res, status);
        });
      }
    };
    /**
     * 取回本地
     */
    $scope.offlineDown = function (complateItem, index) {
      location.assign(`/manager/export/${userId}/dowload/${complateItem.Id}`);
      // notify.info($translate.instant('数据正在下载'));
    };
    /**
     * 一键清除
     */
    $scope.clearAllFile = function () {
      $http.delete(`/manager/export/${userId}/remove_all/complete`).success(function (res, status) {
        if (status === 200) {
          $scope.complateItems = [];
          // notify.info($translate.instant('全部数据删除成功'));
        } else if (status === 202) {
          let err = $translate.instant(`${res.code}export`);
          notify.error(err);
        }
      }).error(function (res, status) {
        handleError(res, status);
      });
    };
    /**
     * 清除文件
     */
    $scope.clearFile = function (complateItem, index) {
      $http.delete(`/manager/export/${userId}/remove/${complateItem.Id}`).success(function (res, status) {
        if (status === 200) {
          $scope.complateItems.splice(index, 1);
          // notify.info($translate.instant('数据删除成功'));
        } else if (status === 202) {
          let err = $translate.instant(`${res.code}export`);
          notify.error(err);
        }
      }).error(function (res, status) {
        handleError(res, status);
      });

    };
    this.cancel = function () {
      $modalInstance.dismiss();
    };
    // 取消按钮
    let cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.cancel = cancel;
  });
