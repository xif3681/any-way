import _ from 'lodash';
import 'plugins/kibana/visualize/saved_visualizations/saved_visualizations';
import 'ui/directives/saved_object_finder';
import 'ui/directives/paginated_selectable_list';
import 'plugins/kibana/discover/saved_searches/saved_searches';
import routes from 'ui/routes';
import RegistryVisTypesProvider from 'ui/registry/vis_types';
import uiModules from 'ui/modules';


const templateStep = function (num, txt) {
  return '<div ng-controller="VisualizeWizardStep' + num + '" class="container-fluid vis-wizard">' + txt + '</div>';
};

const module = uiModules.get('app/visualize', ['kibana/courier']);

/********
/** Wizard Step 1
/********/
routes.when('/visualize/step/1', {
  template: templateStep(1, require('plugins/kibana/visualize/wizard/step_1.html'))
});

module.controller('VisualizeWizardStep1', function ($scope, $route, $location, timefilter, Private,$translate,
 $translatePartialLoader,searchType) {
  //luochunxiang@eisoo.com
  $translatePartialLoader.addPart('../plugins/kibana/visualize');
  $translate.refresh();
  searchType.type = 'visualize';
  var lang = window.localStorage.lang;
  $scope.lang = lang;

  timefilter.enabled = false;

  $scope.visTypes = Private(RegistryVisTypesProvider);
  $scope.visTypeUrl = function (visType) {
    if (!visType.requiresSearch) return '#/visualize/create?type=' + encodeURIComponent(visType.name);
    else return '#/visualize/step/2?type=' + encodeURIComponent(visType.name);
  };
});

/********
/** Wizard Step 2
/********/
routes.when('/visualize/step/2', {
  template: templateStep(2, require('plugins/kibana/visualize/wizard/step_2.html')),
  resolve: {
    indexPatternIds: function (courier) {
      return courier.indexPatterns.getIds();
    }
  }
});

module.controller('VisualizeWizardStep2', function ($route, $scope, $location, timefilter, kbnUrl,
  $translate, $translatePartialLoader,searchType,locals,getPathInfo) {
  //luochunxiang@eisoo.com
  searchType.type = 'visualize';
  var lang = window.localStorage.lang;
  $scope.lang = lang;

  const type = $route.current.params.type;

  $scope.step2WithSearchUrl = function (hit) {
    return kbnUrl.eval('#/visualize/create?&type={{type}}&savedSearchId={{id}}', {type: type, id: hit.id});
  };

  timefilter.enabled = false;

  $scope.indexPattern = {
    selection: null,
    list: $route.current.locals.indexPatternIds
  };

  $scope.makeUrl = function (pattern) {
    if (!pattern) return;
    return `#/visualize/create?type=${type}&indexPattern=${pattern}`;
  };

  /**
   * 日志分组
   */
  //跳转页面
  $scope.jump = function (url) {
    $location.path(url);
  };

  //存储当前节点，刷新是展示
  //存储当前节点，刷新是展示
  $scope.storageNodeIime = function () {
    let childNode = {
      id:$scope.seletedNode.groupId,
      name:$scope.seletedNode.name,
      pathInfo:$scope.currentNode.pathInfo
    };

    locals.setObject('visLogTree',childNode);
  };

   //获取本地存储的信息
  let childNode = locals.getObject('visLogTree', '');

  $scope.seletedNode = {
    groupId:'fe5b7f96-443a-11e7-a467-000c29253e90'
  };
  $scope.currentNode = {};
  $scope.currentNode.pathInfo = childNode.pathInfo || '所有日志';
  $scope.indexPatternName = childNode.name || '所有日志';
  $scope.visListLogTree = 'visListLogTree';//树的id

  $scope.treeClick = function (event, treeId, treeNode, clickFlag) {
    $scope.treeNode = treeNode;
    if ($scope.seletedNode) {
      if ($scope.seletedNode.groupId === treeNode.groupId) {
        return;
      }

    }
    $scope.seletedNode = treeNode;
    $scope.indexPatternName = treeNode.name;

    getPathInfo(treeNode.groupId,$scope.currentNode).then(res=>{
      $scope.storageNodeIime();
      $scope.jump('/visualize/create');
    });



  };
  $scope.treeMethod = {
    treeClick: $scope.treeClick
  };




    /**
   * 日志分组结束
   */
});
