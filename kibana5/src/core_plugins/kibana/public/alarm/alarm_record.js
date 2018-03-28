import _ from 'lodash';
import $ from 'jquery';
import uiRoutes from 'ui/routes';
import uiModules from 'ui/modules';
import arAlarmRecordTemplate from 'plugins/kibana/alarm/alarm_record.html';
import 'ui/anyrobot_ui/tm.pagination';
import 'plugins/kibana/alarm/index';
import 'ui/notify';

uiRoutes
  .when('/alarm/alarmRecord', {
    template: arAlarmRecordTemplate
  });

uiModules
  .get('apps/alarm', ['kibana/notify'])
  .controller('alarmRecord', function ($scope, $location, $http, localsAlarm, Notifier, $interval, $translate, $translatePartialLoader) {
    $translatePartialLoader.addPart('../plugins/kibana/alarm');
    $translate.refresh();
    let lang = window.localStorage.lang;
    let arEventCount;
    let arNumFieldStats;
    let arS;
    let arM;
    let arH;
    let arD;
    let arW;
    let arMon;
    let arMax;
    let arEqu;
    let arMin;
    let arIn;
    let arNotIn;
    let arMaxNum;
    let arMinNum;
    let arAvg;
    let arSum;
    if (lang === 'en-us') {
      arEventCount = 'Count Alert ';
      arNumFieldStats = 'Numeric Field Calculation Alert';
      arS = 'second';
      arM = 'minute';
      arH = 'hour';
      arD = 'day';
      arW = 'week';
      arMon = 'month';
      arMax = '>';
      arEqu = '=';
      arMin = '<';
      arIn = 'in';
      arNotIn = 'not in';
      arMaxNum = 'max';
      arMinNum = 'min';
      arAvg = 'average';
      arSum = 'sum';
    } else if (lang === 'zh-cn') {
      arEventCount = '计数告警';
      arNumFieldStats = '数值字段计算告警';
      arS = '秒';
      arM = '分钟';
      arH = '小时';
      arD = '天';
      arW = '星期';
      arMon = '月';
      arMax = '大于';
      arEqu = '等于';
      arMin = '小于';
      arIn = '介于';
      arNotIn = '非介于';
      arMaxNum = '最大值';
      arMinNum = '最小值';
      arAvg = '平均值';
      arSum = '总和';
    } else {
      arEventCount = '計數告警';
      arNumFieldStats = '數值欄位計算告警';
      arS = '秒';
      arM = '分鐘';
      arH = '小時';
      arD = '天';
      arW = '星期';
      arMon = '月';
      arMax = '大於';
      arEqu = '等於';
      arMin = '小於';
      arIn = '介於';
      arNotIn = '非介於';
      arMaxNum = '最大值';
      arMinNum = '最小值';
      arAvg = '平均值';
      arSum = '總和';
    }


    //提示
    const notify = new Notifier({
      location: $translate.instant('告警')
    });

    var alarmRecord = localsAlarm.getObject('argAlarm', '');
    var thisDataId = alarmRecord.data.id;
    var nowCurRecordItemsPerPage = localsAlarm.get('curRecordItemsPerPage', '');
    $scope.data = {
      'name': alarmRecord.data.name,
      'description': alarmRecord.data.description,
      'status': alarmRecord.data.status,

      'monitor': {
        'type': 'elasticsearch',
        'calculate': alarmRecord.data.monitor.calculate,
        'searchId': alarmRecord.data.monitor.searchId,
        'field': alarmRecord.data.monitor.field,
        'timeRange': alarmRecord.data.monitor.timeRange,
        'timeUnit': alarmRecord.data.monitor.timeUnit,
        'alertType': alarmRecord.data.monitor.alertType,
        'alertTypeName': '',
        'alertTypeField': ''
      },


      'schedule': {
        'type': 'interval',
        'timeUnit': alarmRecord.data.schedule.timeUnit,
        'timeInterval': alarmRecord.data.schedule.timeInterval,
        'startDateTime': alarmRecord.data.schedule.startDateTime
      },

      'condition': {

        'operator': alarmRecord.data.condition.operator,
        'threshold': alarmRecord.data.condition.threshold,
        'floorThreshold': alarmRecord.data.condition.floorThreshold,
        'upperThreshold': alarmRecord.data.condition.upperThreshold
      },

      'notify': {
        'type': 'email',
        'emails': alarmRecord.data.notify.personEmail
      },
      'search': {
        'selectedSearch': alarmRecord.data.selectedSearchTitle,
        'searchDetails': alarmRecord.data.searchDetails,
        'filterTypes': alarmRecord.data.searchFilterTypes
      }
    };


    //alertType告警类型
    $scope.data.monitor.alertTypeEvent = true;
    if (alarmRecord.data.monitor.alertType === 'eventCount' || alarmRecord.data.monitor.alertType === '事件计数') {

      // $scope.data.monitor.alertTypeName = $translate.instant('计数告警');
      $scope.data.monitor.alertTypeName = arEventCount;
      $scope.data.monitor.alertTypeEvent = true;
      $scope.data.monitor.alertTypeField = false;
      $scope.data.monitor.alertTypeNumField = false;
    } else if (alarmRecord.data.monitor.alertType === 'fieldCount' || alarmRecord.data.monitor.alertType === '字段计数') {
      // $scope.data.monitor.alertTypeName = $translate.instant('计数告警');
      $scope.data.monitor.alertTypeName = arEventCount;
      $scope.data.monitor.alertTypeField = true;
      $scope.data.monitor.alertTypeEvent = false;
      $scope.data.monitor.alertTypeNumField = false;
    } else if (alarmRecord.data.monitor.alertType === 'numFieldStats' || alarmRecord.data.monitor.alertType === '数值字段计算告警') {
      // $scope.data.monitor.alertTypeName = $translate.instant('数值字段计算告警');
      $scope.data.monitor.alertTypeName = arNumFieldStats;
      $scope.data.monitor.alertTypeField = false;
      $scope.data.monitor.alertTypeEvent = false;
      $scope.data.monitor.alertTypeNumField = true;
    }
    ;

    //后台所需的执行计划时间单位

    switch (alarmRecord.data.schedule.timeUnit) {

      case 's':
        $scope.data.schedule.timeUnit = arS;
        // $scope.data.schedule.timeUnit = $translate.instant('秒');
        break;
      case 'm':
        $scope.data.schedule.timeUnit = arM;
        // $scope.data.schedule.timeUnit = $translate.instant('分钟');
        break;
      case 'h':
        $scope.data.schedule.timeUnit = arH;
        // $scope.data.schedule.timeUnit = $translate.instant('小时');
        break;
      case 'd':
        $scope.data.schedule.timeUnit = arD;
        // $scope.data.schedule.timeUnit = $translate.instant('天');
        break;
      case 'w':
        $scope.data.schedule.timeUnit = arW;
        // $scope.data.schedule.timeUnit = $translate.instant('星期');
        break;
    }
    //后台所需的触发时间单位
    switch (alarmRecord.data.monitor.timeUnit) {
      case 'm':
        // $scope.data.monitor.timeUnit = $translate.instant('分钟');
        $scope.data.monitor.timeUnit = arM;
        break;
      case 'h':
        // $scope.data.monitor.timeUnit = $translate.instant('小时');
        $scope.data.monitor.timeUnit = arH;
        break;
      case 'd':
        // $scope.data.monitor.timeUnit = $translate.instant('天');
        $scope.data.monitor.timeUnit = arD;
        break;
      case 'M':
        // $scope.data.monitor.timeUnit = $translate.instant('月');
        $scope.data.monitor.timeUnit = arMon;
        break;
    }
    //后台所需的operator比较类型

    switch (alarmRecord.data.condition.operator) {
      case '>':
        // $scope.data.condition.operator = $translate.instant('大于');
        $scope.data.condition.operator = arMax;
        $scope.data.condition.operatorFlag = false;
        break;
      case '==':
        // $scope.data.condition.operator = $translate.instant('等于');
        $scope.data.condition.operator = arEqu;
        $scope.data.condition.operatorFlag = false;
        break;
      case '<':
        // $scope.data.condition.operator = $translate.instant('小于');
        $scope.data.condition.operator = arMin;
        $scope.data.condition.operatorFlag = false;
        break;
      case 'in':
        // $scope.data.condition.operator = $translate.instant('介于');
        $scope.data.condition.operator = arIn;
        $scope.data.condition.operatorFlag = true;
        break;
      case 'not in':
        // $scope.data.condition.operator = $translate.instant('非介于');
        $scope.data.condition.operator = arNotIn;
        $scope.data.condition.operatorFlag = true;
        break;
    }
    //后台所需的calculate
    switch (alarmRecord.data.monitor.calculate) {
      case 'max':
        // $scope.data.monitor.calculate = $translate.instant('最大值');
        $scope.data.monitor.calculate = arMaxNum;
        break;
      case 'min':
        // $scope.data.monitor.calculate = $translate.instant('最小值');
        $scope.data.monitor.calculate = arMinNum;
        break;
      case 'avg':
        // $scope.data.monitor.calculate = $translate.instant('平均值');
        $scope.data.monitor.calculate = arAvg;
        break;
      case 'sum':
        // $scope.data.monitor.calculate = $translate.instant('总和');
        $scope.data.monitor.calculate = arSum;
        break;
    }
    ;

    //分页
    $scope.pageAlarm = {
      recordConf: {
        currentPage: 1,
        itemsPerPage: nowCurRecordItemsPerPage ? nowCurRecordItemsPerPage : 10,
        perPageOptions: [10, 15, 20, 30, 50]
      }
    };
    //分页获取记录详情
    var getAlertLog = function (lim) {
      $http.get(`/manager/alertLog/${thisDataId}/list?start=${$scope.start}&limit=${lim}` + '&timestamp=' + new Date().getTime()).success(function (data) {
        $scope.alertLogs = data;
      });
    };
    //获取每页的监控告警记录
    var getAlarmRecord = function () {
      localsAlarm.set('curRecordItemsPerPage', $scope.pageAlarm.recordConf.itemsPerPage);
      //start = (currentPage - 1)*itemsPerPage
      if ($scope.pageAlarm.recordConf.currentPage === 0) {
        $scope.pageAlarm.recordConf.currentPage = 1;
      }
      $scope.start = ($scope.pageAlarm.recordConf.currentPage - 1) * $scope.pageAlarm.recordConf.itemsPerPage;
      // 判断如果点击的为最后一个，limit=-1
      $scope.recordFlag = parseInt($scope.pageAlarm.recordConf.totalItems / $scope.pageAlarm.recordConf.itemsPerPage);
      if ($scope.recordFlag + 1 === $scope.pageAlarm.recordConf.currentPage) {
        getAlertLog(-1);
        return;
      }
      ;
      //获取监控告警信息
      getAlertLog($scope.pageAlarm.recordConf.itemsPerPage);
    };
    //获取总告警记录详情数量
    var getRecordConfTotalItems = function () {
      $http.get(`/manager/alertLog/${thisDataId}/all` + '?timestamp=' + new Date().getTime()).success(function (data, status) {
        if (status === 200) {
          $scope.pageAlarm.recordConf.totalItems = data.length;
        } else if (status === 202) {
          let errmsg = $translate.instant(data.code.toString());
          notify.error(errmsg);
        }
        ;
      }).error(function (res) {
        // let errmsg = $translate.instant(res.code.toString());
        notify.error(res);
      });
      getAlarmRecord();
    };
    getRecordConfTotalItems();

    //定义定时器,每隔10秒跟新一次告警记录
    var loopGetTotalItems = $interval(getRecordConfTotalItems, 10000);
    loopGetTotalItems.then(function () {
      console.log('completeTotalItems');
    }, function (err) {
      console.log('Uh oh, errorTotalItems!', err);
    }, function () {
      console.log('uploadTotalItems');
    });


    //监听currentPage，itemsPerPage
    $scope.$watch('pageAlarm.recordConf.currentPage + pageAlarm.recordConf.itemsPerPage', getAlarmRecord);


    //返回按钮
    $scope.alarmReturn = function (url) {
      localsAlarm.set('returnRecordAlarm', true);
      $location.path(url);
      //点击返回按钮的时候，取消定时器
      $interval.cancel(loopGetTotalItems);
    };
    //取消定时器
    $scope.$on('$destroy', function () {
      $interval.cancel(loopGetTotalItems);
    });
    $scope.jump = function (url) {
      $location.path(url);
    };

  });


module.exports = {
  name: 'alarmRecord',
  display: 'alarmRecord',
  url: '#/alarm/alarmRecord'
};

