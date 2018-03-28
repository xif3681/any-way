import _ from 'lodash';
import uiRoutes from 'ui/routes';
import uiModules from 'ui/modules';
import 'ui/kbn_top_nav';
import 'plugins/kibana/alarm/styles/main.less';
import $ from 'jquery';
import angular from 'angular';
import arAlarmTemplate from 'plugins/kibana/alarm/index.html';
import 'ui/notify';
import 'ui/anyrobot_ui/tm.pagination';
import 'plugins/kibana/alarm/alarm_record';
import 'plugins/kibana/alarm/new_alarm';
import 'ui/notify';

uiRoutes
  .when('/alarm', {
    template: arAlarmTemplate
  });

uiModules
  .get('alarm', ['kibana/notify'])
  .factory('localsAlarm', ['$window', function ($window) {
    return {        //存储单个属性
      set: function (key, value) {
        $window.localStorage[key] = value;
      },        //读取单个属性
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },        //存储对象，以JSON格式存储
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },        //读取对象
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    };
  }])
  .controller('alarmCtrl', function ($scope, $location, localsAlarm, $http, Notifier, $interval, $translate, $translatePartialLoader) {
    $translatePartialLoader.addPart('../plugins/kibana/alarm');
    $translate.refresh();

    let lang = window.localStorage.lang;
    let arM;
    let arH;
    let arD;
    let arMon;
    if (lang === 'en-us') {
      arM = 'minute';
      arH = 'hour';
      arD = 'day';
      arMon = 'month';
    } else if (lang === 'zh-cn') {
      arM = '分钟';
      arH = '小时';
      arD = '天';
      arMon = '月';
    } else {
      arM = '分鐘';
      arH = '小時';
      arD = '天';
      arMon = '月';
    }
    //提示
    const notify = new Notifier({
      location: $translate.instant('告警')
    });
    $scope.jump = function (url) {
      $location.path(url);
    };
    var nowCurItemsPerPage = localsAlarm.get('curItemsPerPage', '');
    var nowCurAlarmNum = parseInt(localsAlarm.get('curAlarmNum', ''));
    var nowCurAlarmNumTime = parseInt(localsAlarm.get('curAlarmNumTime', ''));
    // 获取告警信息
    $scope.data = {
      'alarmNumTimeSecond': '',
      'alarmTimeRange': ''
    };
    //告警次数的时间单位
    $scope.alarmNumTimes = [{
      id: 1,
      value: arMon
    }, {
      id: 2,
      value: arD
    }, {
      id: 3,
      value: arH
    }, {
      id: 4,
      value: arM
    }];
    $scope.alarmNum = nowCurAlarmNum ? nowCurAlarmNum : 24;
    // $scope.data.alarmNumTimeSecond = 60 * 60;

    $scope.alarmNumChange = function (alarmNum) {
      $scope.alarmNum = alarmNum;

      if (alarmNum === undefined || alarmNum < 1 || !Number.isInteger(alarmNum)) {

        notify.error($translate.instant('时间范围不能为空，且必须为大于0的整数'));
        return;
      } else {
        localsAlarm.set('curAlarmNum', $scope.alarmNum);
      }
      getAlarmInfo();
    };

    $scope.alarmNumTime = nowCurAlarmNumTime ? nowCurAlarmNumTime : $scope.alarmNumTimes[2].id;
    switch ($scope.alarmNumTime) {
      case 1:
        $scope.data.alarmNumTimeSecond = 30 * 24 * 60 * 60;
        break;
      case 2:
        $scope.data.alarmNumTimeSecond = 24 * 60 * 60;
        break;
      case 3:
        $scope.data.alarmNumTimeSecond = 60 * 60;
        break;
      case 4:
        $scope.data.alarmNumTimeSecond = 60;
        break;
    }
    ;

    $scope.alarmNumTimeChange = function (alarmNumTime) {
      $scope.alarmNumTime = alarmNumTime;
      switch ($scope.alarmNumTime) {
        case 1:
          $scope.data.alarmNumTimeSecond = 30 * 24 * 60 * 60;
          break;
        case 2:
          $scope.data.alarmNumTimeSecond = 24 * 60 * 60;
          break;
        case 3:
          $scope.data.alarmNumTimeSecond = 60 * 60;
          break;
        case 4:
          $scope.data.alarmNumTimeSecond = 60;
          break;
      }
      ;
      localsAlarm.set('curAlarmNumTime', $scope.alarmNumTime);
      getAlarmInfo();
    };
    //分页
    $scope.pageAlarm = {
      indexConf: {
        currentPage: 1,
        itemsPerPage: nowCurItemsPerPage ? nowCurItemsPerPage : 10,
        // itemsPerPage: 2,
        perPageOptions: [10, 15, 20, 30, 50]
      }
    };
    //获取到后台alert数据进行处理
    var alarmPageInfo = function (dataAll) {
      var nowCurAlarmNumTime = parseInt(localsAlarm.get('curAlarmNumTime', ''));
      $scope.alarmNumTime = nowCurAlarmNumTime ? nowCurAlarmNumTime : $scope.alarmNumTimes[2].id;

      if (dataAll) {
        $scope.timeRange = $scope.data.alarmNumTimeSecond * $scope.alarmNum;
        dataAll.map(function (obj) {
          //告警类型转换
          switch (obj.monitor.alertType) {
            case  'eventCount':
              obj.monitor.alertType = '事件计数';
              break;
            case 'fieldCount':
              obj.monitor.alertType = '字段计数';
              break;
            case 'numFieldStats':
              obj.monitor.alertType = '数值字段计算告警';
              break;
          }
          ;

          switch (obj.schedule.timeUnit) {
            case  's':
              obj.schedule.timeUnit = '秒';
              break;
            case 'm':
              obj.schedule.timeUnit = '分钟';
              break;
            case 'h':
              obj.schedule.timeUnit = '小时';
              break;
            case 'd':
              obj.schedule.timeUnit = '天';
              break;
            case 'w':
              obj.schedule.timeUnit = '星期';
              break;
          }
          ;
          //获取告警次数
          var objId = obj.id;
          $http.get(`/manager/alertLog/${objId}/count?timeRange=${$scope.timeRange}&timestamp=${new Date().getTime()}`)
            .success(function (data1) {
              obj.alarmTimeRange = data1.count;
            }).error(function (res) {
            // notify.error(`获取告警次数失败！错误信息：${res.errmsg}`);
          });
          //获取搜索信息
          var searchId = obj.monitor.searchId;
          $http.get(`/elasticsearch/.kibana/search/${searchId}`).success(function (dataSearch) {


            obj.selectedSearchTitle = dataSearch._source.title;
            obj.selectedSearch = dataSearch._id;
            //搜索语句
            let query = JSON.parse(dataSearch._source.kibanaSavedObjectMeta.searchSourceJSON).query.query_string.query;
            //过滤条件
            var filterMetas = JSON.parse(dataSearch._source.kibanaSavedObjectMeta.searchSourceJSON).filter;
            var filterTypes = filterMetas;
            obj.searchDetails = query;
            obj.searchFilterTypes = filterTypes;
            obj.monitorSearchError = false;
          }).error(function () {
            obj.monitorSearchError = true;
          });

        });
      }
      $scope.alertItems = dataAll;
    };

    var rememberCurPage = function () {

      //记忆当前为第几页及当前每页显示多少条
      //点击查看告警列表
      var nowCheckAlarm = localsAlarm.get('checkAlarm', '');
      //新建的时候，点击返回按钮
      var returnAlarm = localsAlarm.get('returnAlarm', '');
      //查看告警记录的时候，点击返回按钮
      var returnRecordAlarm = localsAlarm.get('returnRecordAlarm', '');
      //新建或者编辑的时候，记录当前页的信息
      var nowCurPage = localsAlarm.getObject('curPage', '');
      //在这个界面获取告警总数有时延，所以在保存成功后获取放在localStorage
      var nowAlarmAllCount = localsAlarm.get('alarmAllCount', '');
      //点击查看告警列表
      if (nowCheckAlarm) {
        if (nowCurPage.status === 'edit') {
          $scope.pageAlarm = {
            indexConf: {
              itemsPerPage: nowCurItemsPerPage ? nowCurItemsPerPage : 10,
              currentPage: nowCurPage.page
            }
          };
        } else if (nowCurPage.status === 'new') {
          $scope.pageAlarm = {
            indexConf: {
              itemsPerPage: nowCurItemsPerPage ? nowCurItemsPerPage : 10,
              currentPage: Math.ceil(nowAlarmAllCount / $scope.pageAlarm.indexConf.itemsPerPage)
            }
          };
        }
        ;
      }
      //新建的返回按钮
      if (returnAlarm) {
        if (nowCurPage.status === 'new' || nowCurPage.status === 'edit') {
          $scope.pageAlarm = {
            indexConf: {
              itemsPerPage: nowCurItemsPerPage ? nowCurItemsPerPage : 10,
              currentPage: nowCurPage.returnPage
            }
          };
        }
        ;
      }
      //查看告警记录的返回按钮
      if (returnRecordAlarm) {
        if (nowCurPage.status === 'check') {
          $scope.pageAlarm = {
            indexConf: {
              itemsPerPage: nowCurItemsPerPage ? nowCurItemsPerPage : 10,
              currentPage: nowCurPage.returnPage
            }
          };
        }
        ;
      }
      //使用完即销毁
      localsAlarm.set('checkAlarm', '');
      localsAlarm.set('returnAlarm', '');
      localsAlarm.set('returnRecordAlarm', '');
      localsAlarm.set('alarmAllCount', '');
      localsAlarm.setObject('curPage', '');
    };
    //获取监控告警项总数
    var getAlertCount = function () {
      $http.get('/manager/alert/count' + '?timestamp=' + new Date().getTime()).success(function (data) {
        $scope.pageAlarm.indexConf.totalItems = data.count;
        console.log('获取监控告警项总数成功');
      }).error(function (res) {
        // notify.error(`获取监控告警项总数失败！错误信息：${res.errmsg}`);
      });
    };
    //初始化的时候获取所有告警信息
    var getAllAlarmInfo = function () {
      getAlertCount();
      rememberCurPage();
      getAlarmInfo();
    };
    //获取监控告警记录,分页获取，由于最后limit=-1
    var getAlertList = function (lim) {
      $http.get(`/manager/alert/list?start=${$scope.alarmInfoStart}&limit=${lim}` + '&timestamp=' + new Date().getTime()).success(function (data) {
        alarmPageInfo(data);
        // notify.info('获取监控告警记录成功！');
      }).error(function (res) {
        // notify.error(`获取监控告警记录失败！错误信息：${res.errmsg}`);
      });
    };
    //获取每页的监控告警记录
    var getAlarmInfo = function () {
      var curItemsPerPage = $scope.pageAlarm.indexConf.itemsPerPage;
      localsAlarm.set('curItemsPerPage', curItemsPerPage);
      //alarmInfoStart = (currentPage - 1)*itemsPerPage
      if ($scope.pageAlarm.indexConf.currentPage === 0) {
        $scope.pageAlarm.indexConf.currentPage = 1;
      }
      $scope.alarmInfoStart = ($scope.pageAlarm.indexConf.currentPage - 1) * $scope.pageAlarm.indexConf.itemsPerPage;
      // 判断如果点击的为最后一个，limit=-1
      $scope.indexFlag = parseInt($scope.pageAlarm.indexConf.totalItems / $scope.pageAlarm.indexConf.itemsPerPage);
      if ($scope.indexFlag + 1 === $scope.pageAlarm.indexConf.currentPage) {
        getAlertList(-1);
        return;
      }
      ;
      //获取监控告警信息
      getAlertList($scope.pageAlarm.indexConf.itemsPerPage);

    };
    //监听currentPage，itemsPerPage
    $scope.$watch('pageAlarm.indexConf.currentPage + pageAlarm.indexConf.itemsPerPage', getAlarmInfo);
    // if( $scope.pageAlarm.indexConf.currentPage !==1){
    //   $scope.pageAlarm.indexConf.currentPage
    // }

    getAllAlarmInfo();
    //定义定时器,每隔10秒跟新一次告警记录
    var loopGetAllAlarmInfo = $interval(
      function () {
        if (!window.httpActive.length) {
          getAlarmInfo();
        }
      }, 10000);
    // var loopGetAllAlarmInfo = $interval(getAlarmInfo, 10000);
    loopGetAllAlarmInfo.then(function () {
      console.log('completeAlarmInfo');
    }, function (err) {
      console.log('Uh oh, errorAlarmInfo!', err);
    }, function () {
      console.log('uploadAlarmInfo');
    });


    //更改状态
    $scope.alertStateChange = function (alertItem) {
      let data = alertItem;
      let thisDataId = data.id;
      if (data.status) {
        data.status = 0;
        $http.put(`/manager/alert/${thisDataId}/disable`).success(function () {
          notify.info($translate.instant('已关闭当前监控告警项！'));
        });
      } else {
        data.status = 1;
        $http.put(`/manager/alert/${thisDataId}/enable`).success(function () {
          notify.info($translate.instant('已开启当前监控告警项！'));
        });
      }
    };

    //新建告警
    $scope.newAlarmBuild = function () {
      var argsAlarm = {};
      argsAlarm.new = true;
      argsAlarm.data = {};
      localsAlarm.setObject('argAlarm', argsAlarm);

      //新建的时候，记忆当前为第几页
      var curPage = {};
      curPage.status = 'new';
      curPage.page = '';
      curPage.returnPage = $scope.pageAlarm.indexConf.currentPage;
      localsAlarm.setObject('curPage', curPage);

      $scope.jump('/alarm/newAlarm');
      $interval.cancel(loopGetAllAlarmInfo);
    };
    //删除告警
    $scope.newAlarmClear = function (index) {
      var deleteData = $scope.alertItems.splice(index, 1);
      var deleteDataId = deleteData[0].id;
      $http.delete(`/manager/alert/${deleteDataId}`).success(function () {
        // let suc = $translate.instant('删除成功！');
        // notify.info(`${deleteData[0].name}${suc}`);
        //删除后需要重新获取告警总数
        getAllAlarmInfo();
      }).error(function (data) {
        let err = $translate.instant('删除失败！');
        notify.error(`${err}`);
      });
    };
    //编辑告警
    $scope.newAlarmEdit = function (index) {

      var argsAlarm = {};
      argsAlarm.data = $scope.alertItems[index];
      argsAlarm.edit = true;
      localsAlarm.setObject('argAlarm', argsAlarm);

      //编辑的时候，记忆当前为第几页
      var curPage = {};
      curPage.status = 'edit';
      curPage.perPage = $scope.pageAlarm.indexConf.itemsPerPage;
      curPage.page = $scope.pageAlarm.indexConf.currentPage;
      curPage.returnPage = $scope.pageAlarm.indexConf.currentPage;
      localsAlarm.setObject('curPage', curPage);

      $scope.jump('/alarm/newAlarm');
      $interval.cancel(loopGetAllAlarmInfo);
    };
    //查看告警记录
    $scope.newAlarmCheck = function (index) {
      var argsAlarm = {};
      argsAlarm.data = $scope.alertItems[index];
      localsAlarm.setObject('argAlarm', argsAlarm);

      //查看告警记录的时候，记忆当前为第几页
      var curPage = {};
      curPage.status = 'check';
      curPage.perPage = $scope.pageAlarm.indexConf.itemsPerPage;
      curPage.returnPage = $scope.pageAlarm.indexConf.currentPage;
      localsAlarm.setObject('curPage', curPage);


      $scope.jump('/alarm/alarmRecord');
      $interval.cancel(loopGetAllAlarmInfo);
    };
    //取消定时器
    $scope.$on('$destroy', function () {
      $interval.cancel(loopGetAllAlarmInfo);
    });

  });
