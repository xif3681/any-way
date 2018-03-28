import uiRoutes from 'ui/routes';
import uiModules from 'ui/modules';
import angular from 'angular';
import 'ui/notify';
import _ from 'lodash';
import $ from 'jquery';
import 'ui/notify';
import 'plugins/kibana/alarm/index';
import 'plugins/kibana/alarm/save_success_alarm';
import arNewAlarmTemplate from 'plugins/kibana/alarm/new_alarm.html';
//时间控件
import 'plugins/kibana/alarm/styles/main.less';
import 'plugins/kibana/alarm/laydate-master/angular.laydate';
import 'plugins/kibana/alarm/laydate-master/laydate.dev';


uiRoutes
  .when('/alarm/newAlarm', {
    template: arNewAlarmTemplate
  });

uiModules
  .get('apps/alarm', ['kibana/notify'])
  .controller('newAlarm', function ($scope, $location, $http, localsAlarm, Notifier, $translate, $translatePartialLoader,getFields) {
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
    let arTimeinterval;
    let arNone;
    let arSendemail;
    let arNewBulid;
    let arEditBuild;
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
      arAvg = 'avg';
      arSum = 'sum';
      arTimeinterval = 'Time interval';
      arNone = 'None';
      arSendemail = 'Send email';
      arNewBulid = 'New';
      arEditBuild = 'Edit';
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
      arTimeinterval = '时间间隔';
      arNone = '无';
      arSendemail = '发送邮件';
      arNewBulid = '新建';
      arEditBuild = '编辑';
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
      arTimeinterval = '時間間隔';
      arNone = '無';
      arSendemail = '發送郵件';
      arNewBulid = '新建';
      arEditBuild = '編輯';
    }

    //提示
    const notify = new Notifier({
      location: $translate.instant('告警')
    });

    $scope.data = {
      'name': '',
      'description': '',
      'status': 1,
      'monitor': {
        'type': 'elasticsearch',
        'calculate': '',
        'searchId': '',
        'field': '',
        'timeRange': '',
        'timeUnit': '',
        'alertType': ''
      },
      'schedule': {
        'type': 'interval',
        'timeUnit': '',
        'timeInterval': '',
        'startDateTime': ''
      },
      'condition': {

        'operator': '',
        'threshold': '',
        'floorThreshold': '',
        'upperThreshold': ''
      },
      'notify': {
        'type': '',
        'emails': ''
      },
      'search': {
        'selectedSearch': [],
        'searchDetails': '',
        'filterTypes': ''
      },
      'triggerCondition': ''
    };
    //各个下拉列表

    //告警类型
    $scope.alarmTypes = [
      {
        id: 1,
        value: arEventCount,
        enValue: 'alarmCount'
      }, {
        id: 2,
        value: arNumFieldStats,
        enValue: 'numFieldStats'
      }];
    //区间设置
    $scope.intervals = [{
      id: 1,
      value: arMax,
      enValue: '>'
    }, {
      id: 2,
      value: arEqu,
      enValue: '=='
    }, {
      id: 3,
      value: arMin,
      enValue: '<'
    }, {
      id: 4,
      value: arIn,
      enValue: 'in'
    }, {
      id: 5,
      value: arNotIn,
      enValue: 'not in'
    }];
    //触发条件时间区间设置
    $scope.triggerTimeUnits = [{
      id: 1,
      value: arM,
      enValue: 'm'
    }, {
      id: 2,
      value: arH,
      enValue: 'h'
    }, {
      id: 3,
      value: arD,
      enValue: 'd'
    }, {
      id: 4,
      value: arMon,
      enValue: 'M'
    }];
    //数值区间设置
    $scope.numbers = [{
      id: 1,
      value: arMaxNum,
      enValue: 'max'
    }, {
      id: 2,
      value: arMinNum,
      enValue: 'min'
    }, {
      id: 3,
      value: arAvg,
      enValue: 'avg'
    }, {
      id: 4,
      value: arSum,
      enValue: 'sum'
    }];
    //执行计划时间区间设置
    $scope.executeTimeUnits = [{
      id: 1,
      value: arS,
      enValue: 's'
    }, {
      id: 2,
      value: arM,
      enValue: 'm'
    }, {
      id: 3,
      value: arH,
      enValue: 'h'
    }, {
      id: 4,
      value: arD,
      enValue: 'd'
    }, {
      id: 5,
      value: arW,
      enValue: 'w'
    }];
    //执行计划
    $scope.executionPlans = [{
      id: 1,
      value: arTimeinterval,
      enValue: 'interval'
    }];
    //通知方式
    $scope.notifyModes = [{
      id: 0,
      value: arNone,
      enValue: 'none'
    }, {
      id: 1,
      value: arSendemail,
      enValue: 'email'
    }];

    //区间设置
    $scope.intervalChange = function (interval) {
      $scope.upperThresholdInvalid = '';
      $scope.interval = interval;
      if ($scope.interval <= 3) {
        $scope.data.condition.upperThreshold = '';
      }

    };

    //触发条件时间区间设置
    $scope.triggerTimeUnitChange = function (triggerTimeUnit) {
      $scope.data.monitor.timeUnit = triggerTimeUnit;
    };
    //数值区间设置
    $scope.numberChange = function (number) {
      $scope.data.monitor.calculate = number;
    };
    //执行计划，默认为时间间隔
    $scope.executionPlanChange = function (executionPlan) {
      $scope.data.schedule.type = executionPlan;
    };
    //执行时间时间区间设置
    $scope.executeTimeUnitChange = function (executeTimeUnit) {
      $scope.data.schedule.timeUnit = executeTimeUnit;
      watchTimeInterval();
    };
    //通知方式，现在只支持邮件
    $scope.notifyModeChange = function (notifyMode) {
      $scope.data.notify.type = notifyMode;
      watchEmails();
    };
    //告警类型提示
    $scope.alarmPromptEvent = '关注执行已存搜索的事件总数与阈值的对比，例如您可以设置10分钟内已存搜索的事件总数大于20次为告警条件。比较类型包括大于、小于、等于、介于和非介于。';
    $scope.alarmPromptField = '关注执行已存搜索的结果中出现目标字段的计数与阈值的对比，例如您可以设置10分钟内已存搜索中出现XXX字段的频次等于20次为告警条件。比较类型包括大于、小于、等于、介于和非介于。';
    $scope.alarmPromptNumFieldStats = '关注数值型字段的计算结果与阈值的对比，例如您可以设置1个月之内销售额的最小值小于100为告警条件。';
    $scope.alarmTypeChange = function (alarmType) {
      $scope.data.monitor.field = '';
      $scope.data.monitor.timeRange = '';
      $scope.data.condition.threshold = '';
      $scope.data.condition.upperThreshold = '';
      //当编辑为数值字段告警，选为计数告警，显示为事件计数
      if ($scope.data.triggerChangesEvent == undefined) {
        $scope.data.monitor.alertType = 'eventCount';
        $scope.data.triggerChangesEvent = true;
        $scope.data.triggerChangesField = false;
        $scope.alarmPrompt = $scope.alarmPromptEvent;

      }
      $scope.alarmType = alarmType;
      if ($scope.alarmType === 2) {
        //数值计算告警
        $scope.alarmPrompt = $scope.alarmPromptNumFieldStats;
      } else if ($scope.alarmType === 1 && $scope.data.triggerChangesEvent) {
        //事件计数
        $scope.alarmPrompt = $scope.alarmPromptEvent;
      } else if ($scope.alarmType === 1 && $scope.data.triggerChangesField) {
        //字段计数
        $scope.alarmPrompt = $scope.alarmPromptField;
      }
    };

    //事件计数
    $scope.triggerChangeEvent = function () {
      $scope.data.triggerChangesEvent = true;
      $scope.data.triggerChangesField = false;
      $scope.alarmPrompt = $scope.alarmPromptEvent;
      $scope.data.triggerCondition = '';
      $scope.data.monitor.field = '';
      $scope.data.monitor.timeRange = '';
      $scope.data.condition.threshold = '';
      $scope.data.condition.upperThreshold = '';
    };
    //字段计数
    $scope.triggerChangeField = function () {
      $scope.data.triggerChangesField = true;
      $scope.data.triggerChangesEvent = false;
      $scope.alarmPrompt = $scope.alarmPromptField;
      $scope.data.triggerCondition = '';
      $scope.data.monitor.field = '';
      $scope.data.monitor.timeRange = '';
      $scope.data.condition.threshold = '';
      $scope.data.condition.upperThreshold = '';
    };


    //获取的搜索信息
    $http.get('/elasticsearch/.kibana/search/_search?from=0&size=1000').success(function (data) {
      let storeDatas = data.hits.hits;
      let storeDataIds = storeDatas.map(function (obj) {
        obj.id = obj._id;
        obj.value = obj._source.title;
        return obj;
      });
      $scope.selectedExistSearch = storeDataIds;
    });
    //必须有一个新建告警
    $scope.checkAlreadySearch = function () {
      if ($scope.selectedExistSearch === '') {
        confirm($translate.instant('没有已保存的搜索，请先到搜索页面建立搜索信息'));
      }
    };
    //点击已存搜索获取搜索详情
    $scope.selectedExistSearchChange = function (selectedSearch) {
      $scope.data.monitorSearchError = false;
      if (selectedSearch == undefined) {
        $scope.data.search.selectedSearch = '';
        $scope.data.search.searchDetails = '';
        $scope.data.search.filterTypes = '';
        return;
      }
      $scope.data.search.selectedSearch = selectedSearch;
      //搜索详情
      $scope.selectedExistSearch.map(function (obj) {
        if (obj.id == selectedSearch) {
          $scope.data.monitor.searchId = obj._id;
          //搜索语句
          var query = JSON.parse(obj._source.kibanaSavedObjectMeta.searchSourceJSON).query.query_string.query;
          //过滤条件
          var filterMetas = JSON.parse(obj._source.kibanaSavedObjectMeta.searchSourceJSON).filter;
          var filterTypes = filterMetas;
          $scope.data.search.searchDetails = query;
          $scope.data.search.filterTypes = filterTypes;
        }
      });
    };
    //从后台获取select里面的值，并且对其过滤
    let fields = getFields();
    $scope.selectedExistFileAlarm = fields.resultFileAlarm;
    $scope.selectedExistNumAlertFile = fields.resultNumAlertFile;
    //点击数值字段计算告警的字段名称
    $scope.selectedExistNumAlertFileChange = function (selectedSearch) {
      $scope.data.monitor.field = selectedSearch;
    };
    //点击字段计数的字段名称
    $scope.selectedExistFileAlarmChange = function (selectedSearch) {
      $scope.data.monitor.field = selectedSearch;
    };


    $scope.errorThreshold = false;
    //告警名称不能超过255字符
    function watchAlarmName() {
      $scope.$watch('data.name', function () {
        if ($scope.data.name) {
          if ($scope.data.name.length > 255) {
            $scope.errorAlarmName = true;
          } else {
            $scope.errorAlarmName = false;
          }
        } else {
          $scope.errorAlarmName = false;
        }

      });
    };
    //执行计划每隔必须大于10秒执行一次
    function watchTimeInterval() {
      $scope.$watch('data.schedule.timeInterval', function () {
        if ($scope.data.schedule.timeInterval) {
          //必须为整数
          if (!Number.isInteger($scope.data.schedule.timeInterval)) {
            $scope.errorIntTimeInterval = true;
            // return;
          } else {
            $scope.errorIntTimeInterval = false;
          }
          //阈值验证及后面的值必须大于前面的值
          if ($scope.data.schedule.timeInterval < 10 && ($scope.data.schedule.timeUnit == 's' || $scope.data.schedule.timeUnit == '秒')) {
            $scope.errorTimeInterval = true;

          } else {
            $scope.errorTimeInterval = false;
          }
        }
      });

    };


    //前面的阈值
    function watchLowerThreshold() {
      $scope.$watch('data.condition.threshold', function () {
        var regThreshold = /^[0-9]\d*(\.\d+)?$/;
        if (!regThreshold.test($scope.data.condition.threshold)) {
          $scope.data.triggerCondition = '阈值必须非负数';
          $scope.thresholdInvalid = 'input-invalid';
          return;
        } else {
          $scope.data.triggerCondition = '';
          $scope.thresholdInvalid = '';
        }
        //阈值验证及后面的值必须大于前面的值
        if ($scope.interval > 3) {
          if (Number($scope.data.condition.upperThreshold) <= Number($scope.data.condition.threshold)) {

            $scope.data.triggerCondition = '请输入正确的阈值区间值';
            $scope.intervalThreshold = true;
          } else {
            $scope.data.triggerCondition = '';
            $scope.intervalThreshold = '';
          }
        } else {
          $scope.data.triggerCondition = '';
          $scope.intervalThreshold = '';
        }
      });
    };
    watchLowerThreshold();
    //后面的阈值
    function watchUpperThreshold() {
      $scope.$watch('data.condition.upperThreshold', function () {
        var regThreshold = /^[0-9]\d*(\.\d+)?$/;
        if ($scope.interval > 3) {
          if (!regThreshold.test($scope.data.condition.upperThreshold)) {
            $scope.data.triggerCondition = '阈值必须非负数';
            $scope.upperThresholdInvalid = 'input-invalid';
            return;
          } else {
            $scope.data.triggerCondition = '';
            $scope.upperThresholdInvalid = '';
          }
          if (Number($scope.data.condition.upperThreshold) <= Number($scope.data.condition.threshold)) {
            $scope.data.triggerCondition = '请输入正确的阈值区间值';
            $scope.intervalThreshold = true;
          } else {
            $scope.data.triggerCondition = '';
            $scope.intervalThreshold = '';
          }
        } else {
          $scope.data.triggerCondition = '';
          $scope.intervalThreshold = '';
        }
      });
    };
    watchUpperThreshold();


    //邮箱验证
    function watchEmails() {
      $scope.$watch('data.notify.emails', function () {

        var regex = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/;
        let notifyEmails = $scope.data.notify.emails;
        //邮箱编辑的时候，传的值为数组
        if (notifyEmails instanceof Array) {
          $scope.errorEmails = false;
          $scope.emails = notifyEmails;
          return;
        }
        if (notifyEmails) {
          if (notifyEmails.indexOf(',') === -1) {
            $scope.emails = [notifyEmails];
            if (!regex.test(notifyEmails)) {
              $scope.errorEmails = true;
              return;
            } else {
              $scope.errorEmails = false;
            }
          } else {

            let notifyEmailsArr = notifyEmails.split(',');
            $scope.emails = notifyEmailsArr;
            notifyEmailsArr.map(function (obj) {
              if (!regex.test(obj)) {
                $scope.errorEmails = true;
                return;
              } else {
                $scope.errorEmails = false;
              }
            })
          }
        } else {
          $scope.errorEmails = false;
        }
      });
    };
    //触发条件，时间间隔
    function watchTimeRange() {
      $scope.$watch('data.monitor.timeRange', function () {

        var regTimeRange = /^[1-9]\d*$/;
        if (!regTimeRange.test($scope.data.monitor.timeRange)) {
          $scope.data.triggerCondition = '时间范围必须为正整数';
          $scope.timeRangeInvalid = 'input-invalid';
          return;
        } else {
          $scope.data.triggerCondition = '';
          $scope.timeRangeInvalid = '';
        }
      });
    }

    watchTimeRange();
    watchAlarmName();
    // watchThreshold();
    watchTimeInterval();
    watchEmails();
    //保存告警所需要的值
    function saveRule() {
      //后台所需的alertType告警类型
      if ($scope.alarmType === 2) {
        $scope.data.monitor.alertType = 'numFieldStats';
      } else if ($scope.alarmType === 1 && $scope.data.triggerChangesEvent) {
        $scope.data.monitor.alertType = 'eventCount';
      } else if ($scope.alarmType === 1 && $scope.data.triggerChangesField) {
        $scope.data.monitor.alertType = 'fieldCount';
      }
      //后台所需的operator比较类型
      switch ($scope.interval) {
        case 1:
          $scope.data.condition.operator = '>';
          break;
        case 2:
          $scope.data.condition.operator = '==';
          break;
        case 3:
          $scope.data.condition.operator = '<';
          break;
        case 4:
          $scope.data.condition.operator = 'in';
          break;
        case 5:
          $scope.data.condition.operator = 'not in';
          break;
      }
      //后台所需的threshold
      if ($scope.interval <= 3) {
        $scope.data.condition.threshold = $scope.data.condition.threshold;
        $scope.data.condition.floorThreshold = '';
        $scope.data.condition.upperThreshold = '';
      } else {
        $scope.data.condition.floorThreshold = $scope.data.condition.threshold;
      }


      let data = {
        'name': $scope.data.name,
        'description': $scope.data.description,
        'status': $scope.data.status,

        'monitor': {
          'type': 'elasticsearch',
          'calculate': $scope.data.monitor.calculate,
          'searchId': $scope.data.monitor.searchId,
          'field': $scope.data.monitor.field,
          'timeRange': $scope.data.monitor.timeRange,
          'timeUnit': $scope.data.monitor.timeUnit,
          'alertType': $scope.data.monitor.alertType
        },

        'schedule': {
          'type': 'interval',
          'timeUnit': $scope.data.schedule.timeUnit,
          'timeInterval': $scope.data.schedule.timeInterval,
          'startDateTime': $scope.data.schedule.startDateTime
        },

        'condition': {

          'operator': $scope.data.condition.operator,
          'threshold': $scope.data.condition.threshold,
          'floorThreshold': $scope.data.condition.floorThreshold,
          'upperThreshold': $scope.data.condition.upperThreshold
        },

        'notify': {
          'type': $scope.data.notify.type,
          'emails': $scope.emails
        },
        'search': {
          'selectedSearch': $scope.data.search.selectedSearch,
          'searchDetails': $scope.data.search.searchDetails,
          'filterTypes': $scope.data.search.filterTypes
        }
      };
      return data;
    };

    //获取localStorage里面的信息
    var newAlarmBuild = localsAlarm.getObject('argAlarm', '');
    var newAlarmData = newAlarmBuild.data;
    var isEmptyObject = function (obj) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
        ;
      }
      ;
      return true;
    };

    var emptyAlarmObj = isEmptyObject(newAlarmData);

    //新建告警
    if (emptyAlarmObj && newAlarmBuild.new) {

      $scope.newAlarmFlag = true;
      $scope.alarmTypeName = arNewBulid;
      //初始化新建告警数据
      $scope.data = {
        'name': '',
        'description': '',
        'status': 1,
        'monitor': {
          'type': 'elasticsearch',
          'calculate': '',
          'searchId': '',
          'field': '',
          'timeRange': '',
          'timeUnit': '',
          'alertType': ''
        },
        'schedule': {
          'type': 'interval',
          'timeUnit': '',
          'timeInterval': '',
          'startDateTime': ''
        },
        'condition': {

          'operator': '',
          'threshold': '',
          'floorThreshold': '',
          'upperThreshold': ''
        },
        'notify': {
          'type': '',
          'emails': ''
        },
        'search': {
          'selectedSearch': [],
          'searchDetails': '',
          'filterTypes': ''
        }
      };

      //新建告警时下拉框的默认值
      //告警类型
      $scope.alarmType = $scope.alarmTypes[0].id;
      //计数告警初始为事件计数
      $scope.data.monitor.alertType = 'eventCount';
      $scope.data.triggerChangesEvent = true;
      $scope.data.triggerChangesField = false;
      //触发条件的时间区间
      $scope.data.monitor.timeUnit = $scope.triggerTimeUnits[0].enValue;
      //触发条件的比较 >, <, = ...
      $scope.interval = $scope.intervals[0].id;
      //触发条件区间 最大 最小 ...
      $scope.data.monitor.calculate = $scope.numbers[0].enValue;
      //执行计划默认为时间间隔
      $scope.data.schedule.type = $scope.executionPlans[0].enValue;
      //执行计划时间区间
      $scope.data.schedule.timeUnit = $scope.executeTimeUnits[1].enValue;
      //通知方式
      $scope.data.notify.type = $scope.notifyModes[0].enValue;
      //触发方式的提示信息
      $scope.alarmPrompt = $scope.alarmPromptEvent;
      //已存搜索
      $scope.data.search.selectedSearch = '';
      //字段名称
      $scope.data.monitor.field = '';
      // //初始验证的时候
      // $scope.thresholdInvalid = '';
      // $scope.upperThresholdInvalid = '';
      // $scope.timeRangeInvalid = '';
      //保存按钮
      $scope.saveRuleAlarm = function () {

        let data = saveRule();
        //新建告警
        $http.post('/manager/alert', data).success(function (res, status) {
          if (status === 200) {
            $scope.newAlarmFlag = false;
            notify.info($translate.instant('保存成功！'));
            //界面跳转
            $location.path('/alarm/saveSuccessAlarm');
          } else if (status === 202) {
            let msg = $translate.instant(res.code.toString());
            notify.error(msg);
          }
        }).error(function (res) {
          // let msg = $translate.instant(res.code.toString());
          notify.error(res);
        });

      };
    }
    ;

    //编辑告警
    if (!emptyAlarmObj && newAlarmBuild.edit) {
      $scope.editAlarmFlag = true;
      $scope.alarmTypeName = arEditBuild;
      //获取告警信息
      $scope.data = {
        'name': newAlarmBuild.data.name,
        'description': newAlarmBuild.data.description,
        'status': newAlarmBuild.data.status,
        'monitorSearchError': newAlarmBuild.data.monitorSearchError,

        'monitor': {
          'type': 'elasticsearch',
          'calculate': newAlarmBuild.data.monitor.calculate,
          'searchId': newAlarmBuild.data.monitor.searchId,
          'field': newAlarmBuild.data.monitor.field,
          'timeRange': newAlarmBuild.data.monitor.timeRange,
          'timeUnit': newAlarmBuild.data.monitor.timeUnit,
          'alertType': newAlarmBuild.data.monitor.alertType
        },

        'schedule': {
          'type': newAlarmBuild.data.schedule.type,
          'timeUnit': newAlarmBuild.data.schedule.timeUnit,
          'timeInterval': newAlarmBuild.data.schedule.timeInterval,
          'startDateTime': newAlarmBuild.data.schedule.startDateTime
        },

        'condition': {

          'operator': newAlarmBuild.data.condition.operator,
          'threshold': newAlarmBuild.data.condition.threshold,
          'floorThreshold': newAlarmBuild.data.condition.floorThreshold,
          'upperThreshold': newAlarmBuild.data.condition.upperThreshold
        },

        'notify': {
          'type': newAlarmBuild.data.notify.type,
          'emails': newAlarmBuild.data.notify.emails
        },
        'search': {
          'selectedSearch': newAlarmBuild.data.selectedSearch,
          'searchDetails': newAlarmBuild.data.searchDetails,
          'filterTypes': newAlarmBuild.data.searchFilterTypes
        }
      };
      //告警类型转换
      switch ($scope.data.monitor.alertType) {
        case  '事件计数':
          $scope.data.monitor.alertType = 'eventCount';
          break;
        case '字段计数':
          $scope.data.monitor.alertType = 'fieldCount';
          break;
        case '数值字段计算告警':
          $scope.data.monitor.alertType = 'numFieldStats';
          break;
      }
      ;
      //转换为前台alarmType数据
      if ($scope.data.monitor.alertType == 'numFieldStats') {

        $scope.alarmType = 2;
        $scope.alarmPrompt = $scope.alarmPromptNumFieldStats;
      } else if ($scope.data.monitor.alertType == 'eventCount') {
        $scope.alarmType = 1;
        $scope.data.triggerChangesEvent = true;
        $scope.data.triggerChangesField = false;
        $scope.alarmPrompt = $scope.alarmPromptEvent;
      } else if ($scope.data.monitor.alertType == 'fieldCount') {
        $scope.alarmType = 1;
        $scope.data.triggerChangesEvent = false;
        $scope.data.triggerChangesField = true;
        $scope.alarmPrompt = $scope.alarmPromptField;
      }
      ;

      //转换为前台interval数据
      switch ($scope.data.condition.operator) {
        case '>':
          $scope.interval = 1;
          break;
        case '==':
          $scope.interval = 2;
          break;
        case '<':
          $scope.interval = 3;
          break;
        case 'in':
          $scope.interval = 4;
          break;
        case 'not in':
          $scope.interval = 5;
          break;
      }
      //转换为前台schedule.timeUnit数据
      switch ($scope.data.schedule.timeUnit) {
        case  '秒':
          $scope.data.schedule.timeUnit = 's';
          break;
        case '分钟':
          $scope.data.schedule.timeUnit = 'm';
          break;
        case '小时':
          $scope.data.schedule.timeUnit = 'h';
          break;
        case '天':
          $scope.data.schedule.timeUnit = 'd';
          break;
        case '星期':
          $scope.data.schedule.timeUnit = 'w';
          break;
      }
      ;

      var thisDataId = newAlarmBuild.data.id;

      //确定按钮
      $scope.saveRuleAlarm = function () {
        let data = saveRule();
        //修改监控告警
        $http.put(`/manager/alert/${thisDataId}`, data).success(function (res, status) {
          if (status === 200) {
            notify.info($translate.instant('修改成功！'));
            $scope.editAlarmFlag = false;
            $location.path('/alarm/saveSuccessAlarm');
          } else if (status === 202) {
            let msg = $translate.instant(res.code.toString());
            notify.error(msg);
          }
          ;
        }).error(function (res) {
          // let msg = $translate.instant(res.code.toString());
          notify.error(res);
        });
      };
    }
    ;

    //点击返回按钮
    $scope.returnAlarm = function () {
      localsAlarm.set('returnAlarm', true);
      $location.path('/alarm');
      var conNewAlarmReturn = localsAlarm.getObject('curPage', '');
      if (conNewAlarmReturn.returnPage === 'conNewAlarm') {
        $location.path('/alarm/saveSuccessAlarm');
      }
    };

    $scope.jump = function (url) {
      $location.path(url);
    };
    //点击邮箱验证
    $scope.emailVerify = function () {
      var data = {
        'emails': $scope.emails
      };
      $http.post('/manager/smtp/test', data).success(function (res, status) {
        if (status === 200) {
          notify.info($translate.instant('已发送测试邮件至您指定的邮箱，请前往查看！'));
        } else if (status === 202) {
          let errmsg = $translate.instant(res.code.toString());
          notify.error(errmsg);
        }
        ;
      }).error(function (res) {
        // let msg = $translate.instant('验证失败');
        notify.error(res);
      });
    };
  });

module.exports = {
  name: 'newAlarm',
  display: 'newAlarm',
  url: '#/alarm/newAlarm'
};
