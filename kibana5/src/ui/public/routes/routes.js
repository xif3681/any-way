import RouteManager from './route_manager';
import 'angular-route/angular-route';
import uiModules from 'ui/modules';
let defaultRouteManager = new RouteManager();

module.exports = {
  ...defaultRouteManager,
  enable() {
    uiModules
      .get('kibana', ['ngRoute'])
      .config(defaultRouteManager.config)
      .run(['$rootScope', '$location', '$http', '$window', '$cookieStore', 'chrome', function ($rootScope, $location, $http, $window, $cookieStore, chrome) {
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
          // 第三方应用登录认证
          $rootScope.appLoginErr = false;//界面显示错误信息
          $rootScope.appLogin = false;//头部navbar用户名显示
          let urlPath = $location.path();
          let urlSearch = $location.search();
          if (urlPath === '/appLogin' && urlSearch.appId && urlSearch.appId === 'AnyShare') {
            $http.post('/manager/auth/appLogin', urlSearch).success(function (res, status) {
              if (status === 200) {
                $window.localStorage.setItem('appUser', JSON.stringify({
                  token: res.token,
                  appName: urlSearch.account,
                  appId: urlSearch.appId
                }));
                $rootScope.appName = urlSearch.account;
                $location.path('dashboard');
                $rootScope.appLogin = true;
                $rootScope.$emit('router-change', $rootScope.appLogin, $rootScope.appName, $rootScope.appLoginErr);
              } else if (status === 202) {
                $rootScope.appLoginErr = res.code + 'appLogin';
                $location.path('login');
                // 第三方应用登录认证，失败，
                $window.localStorage.setItem('appUser', JSON.stringify({
                  appLoginErr: res.code + 'appLogin',
                  appName: urlSearch.account,
                  appId: urlSearch.appId
                }));
                $rootScope.$emit('router-change', $rootScope.appLogin, $rootScope.appName, $rootScope.appLoginErr);
              }
            });
          } else if (urlSearch.embed) {
            //分享短链
            let url = $location.url();
            $location.url(url);
          }

          let localAppUser = JSON.parse($window.localStorage.getItem('appUser'));
          if (urlPath !== '/appLogin' && !urlSearch.embed) {
            // 第三方应用登录认证，上次成功登录，即可以一直使用AnyRobot
            if (localAppUser && localAppUser.token) {
              if ($location.path() === '/login') {
                $location.path('dashboard');
              }
              if ($rootScope.appLoginFlag !== 'appLoginFlag') {
                $rootScope.appName = localAppUser.appName;
                $location.path('dashboard');
                $rootScope.appLogin = true;
                $rootScope.appLoginFlag = 'appLoginFlag';
                $rootScope.$emit('router-change', $rootScope.appLogin, $rootScope.appName, $rootScope.appLoginErr);
              }
            } else if (localAppUser && localAppUser.appLoginErr) {
              $rootScope.appLoginErr = localAppUser.appLoginErr;
              $location.path('login');
              $rootScope.$emit('router-change', $rootScope.appLogin, $rootScope.appName, $rootScope.appLoginErr);
            }
          }

          if (urlPath !== '/appLogin' && !urlSearch.embed && !localAppUser) {
            if (!$cookieStore.get('currentUserApp')) {
              //没有登录，直接修改#后面的url
              $location.path('login');
            } else if ($cookieStore.get('currentUserApp')) {
              //登录后，直接修改#后面的url到login，不让
              if ($location.path() === '/login') {
                $location.path('discover');
              }
            }
          }
        });
      }
      ])
    ;

  }
}
;
