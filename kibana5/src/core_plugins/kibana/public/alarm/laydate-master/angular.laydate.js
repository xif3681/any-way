define(function (require) {
  var _ = require('lodash');
  var $ = require('jquery');
  var module = require('ui/modules').get('kibana');
  module.directive('defLaydate', function($timeout) {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      link: function(scope, element, attr, ngModel) {
        var _date = null,_config={};
        // // 渲染模板完成后执行
        $timeout(function(){
          // 初始化参数
        _config = {
          elem: '#' + attr.id,
          format: 'YYYY-MM-DD hh:mm:ss',
          min: laydate.now(), //设定最小日期为当前日期
          init: false,
          istime: true,
          istoday: true,
          skin: 'default', //初始化皮肤
          choose: function(data) {
            ngModel.$setViewValue(data);
          },
          clear:function(){
            ngModel.$setViewValue(null);
          }
        };
        // 初始化
        _date= laydate(_config);
        // 模型值同步到视图上
        ngModel.$render = function() {
          element.val(ngModel.$viewValue || '');
        };
        // 监听元素上的事件
        //   console.log(element.find('#laydate_today'))
        // element.on('blur keyup change click', function(data) {
        //   // console.log(data)
        //   ngModel.$setViewValue(data);
        // });

        setVeiwValue();

        // 更新模型上的视图值
        function setVeiwValue() {
          var val = element.val();
          ngModel.$setViewValue(val);
        }
      },0);
      }
      }
  })})
