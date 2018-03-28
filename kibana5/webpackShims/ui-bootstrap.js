define(function (require) {
  require('angular');
  require('ui/angular-bootstrap/index');

  return require('ui/modules')
  //.get('kibana', ['ui.bootstrap'])
  .get('kibana', ['ui.bootstrap', 'pascalprecht.translate'])//导入模块
  .config(function ($tooltipProvider) {
    $tooltipProvider.setTriggers({ 'mouseenter': 'mouseleave click' });
  })
  //config 函数用 $translateProvider 服务配置 $translate 服务实现.
  .config(function ($translateProvider, $translatePartialLoaderProvider) {
    //localStorage.lang  来存储用户上一次选择的语言,如果用户是第一次登录,默认显示中文
    var lang = window.localStorage.lang || 'zh-cn';
    window.localStorage.lang = lang;
    $translateProvider.preferredLanguage(lang);
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '{part}/i18n/{lang}.json'
    });
    // Enable escaping of HTML
    // $translateProvider.useSanitizeValueStrategy('sanitize');
    $translateProvider.useSanitizeValueStrategy(null);
    $translateProvider.fallbackLanguage('en-us');
  })
  .filter('T', ['$translate', function ($translate) {
    return function (key) {
      if (key) {
        return $translate.instant(key);
      }
    };
  }])
  .factory('T', ['$translate', function ($translate) {
    var t = {
      t:function (key) {
        if (key) {
          return $translate.instant(key);
        }
        return key;
      }
    };
    return t;
  }]);


});
