import _ from 'lodash';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import uiModules from 'ui/modules';
import _arSearch from 'ui/courier/fetch/strategy/searchChange';
// get the kibana/metric_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/kibana_plugin_monitor', ['kibana']);

module.controller('KbnStateVisController', function ($scope, Private) {

  /**
   * 对象数组根据对象object key的值排序
   */
  function keysrt(key, desc) {
    return function (a, b) {
      return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);//~~利用符号进行的类型转换,转换成数字类型
    };
  }

  $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
    $scope.resp = resp;
    $scope.vis.params.name = $scope.vis.params.nameAnother;
    $scope.vis.params.color = $scope.vis.params.colorAnother;
    if (resp && resp.reuslts) {
      //后台获取到的结果
      let hitsTotalArr = [];
      resp.reuslts.map((obj, i)=> {
        hitsTotalArr.push(obj.hits.total);
      });
      let monitorVisAggs = $scope.vis.aggs;
      let monitorVisDeepClone = _.toArray(_.cloneDeep($scope.vis.aggs));
      //monitorVisDeepClone排序，和后台返回的数据顺序进行匹配
      monitorVisDeepClone.sort(keysrt('id', false));
      let flag = 0;
      let idFlagIndex = monitorVisAggs.length;
      //如果条件都满足，显示在界面上的第一个颜色
      let compareIdIndex = (monObjTOIndex)=> {
        monitorVisAggs.map((obj, i)=> {
          if (obj.id === monObjTOIndex.id) {
            if (i < idFlagIndex) {
              idFlagIndex = i;
              $scope.vis.params.name = monObjTOIndex.name;
              $scope.vis.params.color = monObjTOIndex.color;
            }
          }
        });
      };
      // monObj与hitsTotalArr的值进行比较，找到符合条件的
      let compareMonHits = (monObj)=> {
        switch (monObj.interval) {
          case 1:
            if (hitsTotalArr[flag - 1] > monObj.threshold) {
              $scope.vis.params.srarchObj.push({fieldName: monObj.fieldName, fieldValue: monObj.fieldValue});
              compareIdIndex(monObj);
            }
            break;
          case 2:
            if (hitsTotalArr[flag - 1] === monObj.threshold) {
              $scope.vis.params.srarchObj.push({fieldName: monObj.fieldName, fieldValue: monObj.fieldValue});
              compareIdIndex(monObj);
            }
            break;
          case 3:
            if (hitsTotalArr[flag - 1] < monObj.threshold) {
              $scope.vis.params.srarchObj.push({fieldName: monObj.fieldName, fieldValue: monObj.fieldValue});
              compareIdIndex(monObj);
            }
            break;
          case 4:
            if (hitsTotalArr[flag - 1] >= monObj.threshold && hitsTotalArr[flag - 1] <= monObj.upperThreshold) {
              $scope.vis.params.srarchObj.push({fieldName: monObj.fieldName, fieldValue: monObj.fieldValue});
              compareIdIndex(monObj);
            }
            break;
          case 5:
            if (hitsTotalArr[flag - 1] < monObj.threshold || hitsTotalArr[flag - 1] > monObj.upperThreshold) {
              $scope.vis.params.srarchObj.push({fieldName: monObj.fieldName, fieldValue: monObj.fieldValue});
              compareIdIndex(monObj);
            }
            break;
        }
      };
      monitorVisDeepClone.map((obj, i)=> {
        if (obj.params.monitors && obj.enabled) {
          obj.params.monitors.map((monObj, j)=> {
            flag++;
            monObj.color = obj.params.color;
            monObj.name = obj.params.name;
            monObj.id = obj.id;
            compareMonHits(monObj);
          });
        }
      });
      if ($scope.vis.params.srarchObj.length) {
        let searchUrl = '* AND ( ';
        $scope.vis.params.srarchObj.map((obj, i)=> {
          if (i === $scope.vis.params.srarchObj.length - 1) {
            searchUrl += `${obj.fieldName}:"${obj.fieldValue}" )`;
          } else {
            searchUrl += `${obj.fieldName}:"${obj.fieldValue}" OR `;
          }
        });
        $scope.vis.params.searchUrl = `#/discover?url=${searchUrl}#monitor`;
      }
    }
  });
});
