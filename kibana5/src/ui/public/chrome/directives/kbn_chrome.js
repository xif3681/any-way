import $ from 'jquery';
import angular from 'angular';
import {remove} from 'lodash';
import 'ui/notify';

import './kbn_chrome.less';
import 'ui/directives/modal/style_ed.less';
// import './login/css/login.css';
import UiModules from 'ui/modules';
import {isSystemApiRequest} from 'ui/system_api';
import {
  getUnhashableStatesProvider,
  unhashUrl,
} from 'ui/state_management/state_hashing';

export default function (chrome, internals) {

  UiModules
    .get('kibana')
    .directive('kbnChrome', ($rootScope, $translate, $translatePartialLoader, Notifier, safeModal) => {

      $translatePartialLoader.addPart('../plugins/kibana');
      $translate.refresh();
      return {
        template($el) {
          const $content = $(require('./kbn_chrome.html'));
          const $app = $content.find('.application');
          if (internals.rootController) {
            $app.attr('ng-controller', internals.rootController);
          }
          if (internals.rootTemplate) {
            $app.removeAttr('ng-view');
            $app.html(internals.rootTemplate);
          }
          return $content;
        },

        controllerAs: 'chrome',
        controller($scope, $rootScope, $location, $http, Private) {

          const getUnhashableStates = Private(getUnhashableStatesProvider);

          // are we showing the embedded version of the chrome?
          internals.setVisibleDefault(!$location.search().embed);

          // listen for route changes, propogate to tabs
          const onRouteChange = function () {
            const urlWithHashes = window.location.href;
            const urlWithStates = unhashUrl(urlWithHashes, getUnhashableStates());
            internals.trackPossibleSubUrl(urlWithStates);
          };

          $rootScope.$on('$routeChangeSuccess', onRouteChange);
          $rootScope.$on('$routeUpdate', onRouteChange);
          onRouteChange();

          const allPendingHttpRequests = () => $http.pendingRequests;
          const removeSystemApiRequests = (pendingHttpRequests = []) => remove(pendingHttpRequests, isSystemApiRequest);
          $scope.$watchCollection(allPendingHttpRequests, removeSystemApiRequests);

          // and some local values
          chrome.httpActive = $http.pendingRequests;
          window.httpActive = $http.pendingRequests;
          $scope.notifList = require('ui/notify')._notifs;
          $scope.safeModal = safeModal;

          return chrome;
        }
      };
    })

    .controller('AppController', function ($scope, $rootScope, $http, $location, $window) {
      $rootScope.$on('router-change', function (event, appLogin, appName, appLoginErr) {
        $scope.appLogin = appLogin;
        $scope.appName = appName;
        $scope.appLoginErr = appLoginErr;
      });
      //开始加载的时候，隐藏掉，要显示登录界面
      $(document).find('#kibana-body').hide();
      $scope.$on('displayName_parent_controller', function (event, displayName) {
        $scope.displayName = displayName;
        $scope.$broadcast('displayName_ch_controller', $scope.displayName);
      });

    })
    .controller('LoginController', function ($scope, $rootScope, $http, $location, $translate, Notifier, $window, $modal, $cookieStore, $log) {

      $scope.$on('displayName_ch_controller', function (event, displayName) {
        $scope.displayName = displayName;
      });
      // let currentUserApp = JSON.parse(sessionStorage.getItem('currentUserApp'));
      let currentUserApp;
      if ($cookieStore.get('currentUserApp')) {
        currentUserApp = JSON.parse($cookieStore.get('currentUserApp'));
      }
      $scope.displayName = currentUserApp && currentUserApp.displayName;
      var lang = $translate.use();
      $scope.lang = lang;
      var locationLogin;
      $scope.row = 1;
      if (lang === 'zh-cn') {
        locationLogin = '登陆';
      } else if (lang === 'zh-tw') {
        locationLogin = '登陆';
      } else {
        locationLogin = 'Login';
        $scope.row = 2;
      }
      //提示
      const notify = new Notifier({
        location: locationLogin
      });
      //登陆
      $scope.usernameError = false;//检查用户名
      $scope.passwordError = false;//检查密码
      $scope.loginError = false;//检查用户名
      $scope.systermError = false;//服务异常！
      $scope.$watch('displayName', function (newValue, oldValue) {
        if ($scope.displayName !== '' || $scope.displayName !== undefined) {
          $scope.displayName = newValue;
        }
      });
      $scope.$watch('username', function (newValue, oldValue) {
        if ($scope.username !== '' || $scope.username !== undefined) {
          $scope.usernameError = false;//检查用户名
        }
      });
      $scope.$watch('password', function (newValue, oldValue) {
        if ($scope.password !== '' || $scope.password !== undefined) {
          $scope.passwordError = false;//检查密码
        }
      });
      //注销按钮回到登录页面
      $scope.LogOff = function () {
        // event.preventDefault();//取消默认行为
        //   event.stopPropagation();//取消冒泡
        $window.location.assign('/app/kibana#/login');
        $location.replace();
        $cookieStore.remove('currentUserApp')
        // $window.sessionStorage.removeItem('currentUserApp');
      };

      //修改密码
      $scope.modal = function () {

        $modal.open({
          controller: 'modifyController as modify',
          templateUrl: 'modify.html',
          windowClass: 'edModal',// 自定义modal上级div的class
          size: 'sm', //大小配置
          resolve: {
            isUserAuth: function () {
              return $scope.isUserAuth;
            },
            userId: function () {
              return JSON.parse($cookieStore.get('currentUserApp')).userId;
              // return JSON.parse(sessionStorage.getItem('currentUserApp')).userId;
            },
            logOff: function () {
              return $scope.LogOff;
            }
          }
        });
      };


    })
    .controller('modifyController', function ($modalInstance, $scope, $http, isUserAuth, userId, $window, logOff, $timeout, $translate) {

      $scope.lang = $translate.use();

      // $scope.isUserAuth = isUserAuth;
      $scope.userId = userId;
      $scope.LogOff = logOff;
      // 取消按钮
      var cancel = function () {
        $modalInstance.dismiss('cancel');
      };
      $scope.cancel = cancel;
      this.cancel = function () {
        $modalInstance.dismiss();
      };

      $scope.currentPasswordError = false;//旧密码错误
      $scope.newPasswordError = false;//新密码错误
      $scope.newPasswordChackError = false;//确认密码错误
      $scope.systermError = false;//后台错误
      $scope.modifySuss = false;//修改密码成功

      //计时器
      var timeout;


      $scope.confirm = function () {
        if ($scope.currentPassword === '' || $scope.currentPassword === undefined) {
          $scope.currentPasswordError = true;//当前密码
          $scope.systermError = false;//后台错误
          $scope.currentPasswordErrorMess = '请输入当前密码';
        } else if ($scope.newPassword === '' || $scope.newPassword === undefined) {
          $scope.newPasswordError = true;//新密码
          $scope.systermError = false;//后台错误
          $scope.newPasswordErrorMess = '新密码不能为空';
        } else if ($scope.newPassword.length < 6) {
          $scope.newPasswordError = true;//新密码
          $scope.systermError = false;//后台错误
          $scope.newPasswordErrorMess = '长度不能低于6位';
        } else if ($scope.newPassword.length > 50) {
          $scope.newPasswordError = true;//新密码
          $scope.systermError = false;//后台错误
          $scope.newPasswordErrorMess = '长度不能超过50位';
        } else if ($scope.newPassword === $scope.currentPassword) {
          $scope.newPasswordError = true;//新密码
          $scope.systermError = false;//后台错误
          $scope.newPasswordErrorMess = '新密码不能和旧密码相同';
        } else if ($scope.newPasswordChack === '' || $scope.newPasswordChack === undefined) {
          $scope.newPasswordChackError = true;
          $scope.systermError = false;//后台错误
          $scope.newPasswordChackMess = '确认密码不能为空';

        } else if ($scope.newPasswordChack !== $scope.newPassword) {
          $scope.newPasswordChackError = true;//确认密码
          $scope.systermError = false;//后台错误
          $scope.newPasswordChackMess = '两次输入的密码不一致';
        } else {
          let data = {
            'currentPassword': $scope.currentPassword,
            'newPassword': $scope.newPassword
          };
          $http.put(`/manager/user/${$scope.userId}/password`, data).success(function (res, status) {
            if (status === 200) {
              $scope.modifySuss = true;//修改密码成功
              if (timeout) $timeout.cancel(timeout);
              timeout = $timeout(function () {
                cancel();
                logOff();
              }, 2000);

            } else {
              $scope.systermError = true;//后台错误
              $scope.currentPasswordError = false;//当前密码
              $scope.newPasswordError = false;//新密码
              $scope.newPasswordChackError = false;//确认密码
              if (res.code === 3758948360) {
                $scope.userErrorMessge = '当前密码错误';
                //$scope.userErrorMessge = res.message;
                $scope.passErrorMessge = '';
              } else if (res.code === 3758948353) {
                $scope.userErrorMessge = '用户不存在';
                //$scope.userErrorMessge = res.message;
                $scope.passErrorMessge = '';
              } else if (res.code === 3758948358) {
                $scope.passErrorMessge = '密码长度必须为6~50位';
                //$scope.passErrorMessge = res.message;
                $scope.userErrorMessge = '';
              } else if (res.code === 3758948366) {
                $scope.userErrorMessge = '用户名被禁用';
                //$scope.userErrorMessge = res.message;
                $scope.passErrorMessge = '';
              } else {
                $scope.errorMessge = res.message;
                $scope.userErrorMessge = '';
                $scope.passErrorMessge = '';
              }
            }

          }).error(function (res, status) {
            $scope.systermError = true;//服务异常！
            $scope.currentPasswordError = false;//当前密码
            $scope.newPasswordError = false;//新密码
            $scope.newPasswordChackError = false;//确认密码
            if (status === 502) {
              $scope.errorMessge = '服务异常！';
            } else {
              $scope.errorMessge = res.message;//后台错误
            }
          });
        }

      };


      $scope.$watch('currentPassword', function (newValue, oldValue) {
        if ($scope.currentPassword !== '' || $scope.currentPassword !== undefined) {
          $scope.currentPasswordError = false;//检查旧密码
        }
      });
      $scope.$watch('newPassword', function (newValue, oldValue) {
        if ($scope.newPassword !== '' || $scope.newPassword !== undefined) {
          $scope.newPasswordError = false;//检查新密码
        }
      });
      $scope.$watch('newPasswordChack', function (newValue, oldValue) {
        if ($scope.newPasswordChack !== '' || $scope.newPasswordChack !== undefined) {
          $scope.newPasswordChackError = false;//检查确认密码
        }
      });
    })
    .controller('LanguageController', function ($scope, $http, $location, $translate) {
      // 语言选择
      $scope.languageList = [{'id': 0, 'title': '简体中文', 'value': 'zh-cn'},
        {'id': 1, 'title': '繁體中文', 'value': 'zh-tw'}, {'id': 2, 'title': 'English', 'value': 'en-us'}];
      var getLanguage = function (index) {
        var currentLanguage = {};
        switch (index) {
          case 0:
          case 'zh-cn':
            currentLanguage.title = '简体中文';
            currentLanguage.value = 'zh-cn';
            break;
          case 1:
          case 'zh-tw':
            currentLanguage.title = '繁體中文';
            currentLanguage.value = 'zh-tw';
            break;
          case 2:
          case 'en-us':
            currentLanguage.title = 'English';
            currentLanguage.value = 'en-us';
            break;
          default:
            break;
        }
        ;
        return currentLanguage;

      };

      var curLang = $translate.use();
      var currentLanguage = getLanguage(curLang);
      $scope.curLang = currentLanguage.title;


      $scope.setLang = function (index) {
        var currentLanguage = getLanguage(index);
        var lang = currentLanguage.value;
        $translate.use(lang);
        window.localStorage.lang = lang;
        // $scope.curLang = currentLanguage.title;
        window.location.reload();
      };


    })
    .controller('demoController', function ($modal, $scope, $log, $http, $location, $translate) {

      this.modal = function () {
        $modal.open({
          controller: 'modalController as modal',
          templateUrl: 'modal.html',
          windowClass: 'aboutModal',// 自定义modal上级div的class
          size: 'sm', //大小配置
        });
      };

    })
    .controller('modalController', function ($modalInstance, $scope, $http) {
      $http.get(`/v1/version?timestamp=${new Date().getTime()}`).success(function (data) {
        $scope.versionInfo = data;
      });
      let myDate = new Date();
      $scope.fullYear = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
      this.cancel = function () {
        $modalInstance.dismiss();
      };
    });


}
