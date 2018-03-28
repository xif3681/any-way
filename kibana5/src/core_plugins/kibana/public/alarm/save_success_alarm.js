/**
 * Created by tianyuanfeng on 2016/9/27.
 */


import uiRoutes from 'ui/routes';
import uiModules from 'ui/modules';
import angular from 'angular';
import 'ui/notify';
import _ from 'lodash';
import $ from 'jquery';
import 'ui/notify';
import 'plugins/kibana/alarm/styles/main.less';
import 'ui/anyrobot_ui/tm.pagination';


import 'plugins/kibana/alarm/alarm_record';
import 'plugins/kibana/alarm/new_alarm';
import 'plugins/kibana/alarm/index';
import arSaveSuccessAlarmTemplate from 'plugins/kibana/alarm/save_success_alarm.html';

uiRoutes
  .when('/alarm/saveSuccessAlarm', {
    template: arSaveSuccessAlarmTemplate
  });

uiModules
  .get('alarm', ['kibana/notify'])
  .controller('saveSuccessAlarm', function ($scope, $location, localsAlarm, $http, Notifier, $translatePartialLoader, $translate) {
    $translatePartialLoader.addPart('../plugins/kibana/alarm');
    $translate.refresh();
    //提示
    const notify = new Notifier({
      location: $translate.instant('告警')
    });
    $scope.jump = function (url) {
      $location.path(url);
    };
    //继续新建告警
    var beforecurPage;
    $scope.conNewAlarmBuild = function () {
      var argsAlarm = {};
      argsAlarm.new = true;
      argsAlarm.data = {};
      localsAlarm.setObject('argAlarm', argsAlarm);
      let beforecurPage = localsAlarm.getObject('curPage', '');
      localsAlarm.setObject('beforecurPage', beforecurPage);
      //新建的时候，记忆当前为第几页
      if (localsAlarm.get('returnAlarm', '')) {
        localsAlarm.set('returnAlarm', '');
      } else {
        var curPage = {};
        curPage.status = 'new';
        curPage.page = '';
        curPage.returnPage = 'conNewAlarm';
        localsAlarm.setObject('curPage', curPage);
      }


      $scope.jump('/alarm/newAlarm');
    };
    $scope.checkAlarmList = function () {

      if (localsAlarm.get('returnAlarm', '')) {
        localsAlarm.set('returnAlarm', '');
        let beforecurPage = localsAlarm.getObject('beforecurPage', beforecurPage);
        localsAlarm.setObject('curPage', beforecurPage);
      }

      //查看告警任务列表
      var checkAlarm = localsAlarm.get('checkAlarm', '');
      if (!checkAlarm) {
        localsAlarm.set('checkAlarm', true);
      }
      $scope.jump('/alarm');
    };
    var getAlertCount = function () {
      $http.get('/manager/alert/count' + '?timestamp=' + new Date().getTime()).success(function (data) {
        // console.log('获取监控告警项总数成功')
        localsAlarm.set('alarmAllCount', data.count);
      }).error(function (res) {
        let msg = $translate.instant('获取监控告警项总数失败');
        notify.error(msg);
      });
    };
    getAlertCount();
  });

module.exports = {
  name: 'saveSuccessAlarm',
  display: 'saveSuccessAlarm',
  url: '#/alarm/saveSuccessAlarm'
};
