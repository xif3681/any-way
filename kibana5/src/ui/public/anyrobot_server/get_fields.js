
import _ from 'lodash';
import uiModules from 'ui/modules';
uiModules
  .get('kibana',['kibana/notify'])
  .factory('getFields', function (Notifier,$http) {

     //从后台获取select里面的值，并且对其过滤
    let getFields = function () {
      var resultNumAlertFile = [];
      var resultFileAlarm = [];
      var resultsNoKeyword = [];
      let url = '/elasticsearch/logstash-*/_mapping/field/*?ignore_unavailable=false&allow_no_indices=false&include_defaults=true';
      $http.get(url).success(function (data) {

        //取json数据，里面包含type=name值的json里面的key值
        var reg = /^[@_][\w]+$/;
        //获取数值字段计算告警的字段名称
        function getNumAlertFileJsonValue(obj, name) {
          var result = null;
          var value = null;
          for (var key in obj) {
            value = obj[key];
            if (value === name) {
              return value;
            } else {
              if (typeof value === 'object') {
                result = getNumAlertFileJsonValue(value, name);
                if (result === name) {
                  var flag = false;
                  resultNumAlertFile.map(function (obj) {
                    if (obj === key) {
                      flag = true;
                    }
                  });
                  if (!flag && !reg.test(key)) {
                    resultNumAlertFile.push(key);
                  }
                }
              }
            }
          }
        };
        getNumAlertFileJsonValue(data, 'long');
        getNumAlertFileJsonValue(data, 'integer');
        getNumAlertFileJsonValue(data, 'short');
        getNumAlertFileJsonValue(data, 'byte');
        getNumAlertFileJsonValue(data, 'double');
        getNumAlertFileJsonValue(data, 'float');


        //获取字段计数的字段名称
        function getFileAlarmJsonValue(obj, name) {
          var result = null;
          var value = null;
          let field = '.' + 'keyword';////过滤.keyword的字段
          for (var key in obj) {
            value = obj[key];
            if (key === name) {
              var flag = false;
              resultFileAlarm.map(function (obj) {
                if (obj === value) {
                  flag = true;
                }
              });
              if (!flag && !reg.test(value)) {
                resultFileAlarm.push(value);
                ////过滤.keyword的字段

                if (value.indexOf(field) === -1) {
                  resultsNoKeyword.push(value);
                }
              }
            } else {
              if (typeof value === 'object') {
                getFileAlarmJsonValue(value, name);

              }
            }
          }

        }

        getFileAlarmJsonValue(data, 'full_name');


      });


      let resultFile = {
        resultsNoKeyword:resultsNoKeyword,
        resultFileAlarm:resultFileAlarm,
        resultNumAlertFile:resultNumAlertFile
      };

      return resultFile;
    };
    return getFields;
  });
