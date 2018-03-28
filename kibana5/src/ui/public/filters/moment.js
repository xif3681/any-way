import moment from 'moment';
import _ from 'lodash';
import uiModules from 'ui/modules';

uiModules
  .get('kibana')
  .filter('moment', function (config) {
    return function (datetime) {
      //const format = config.get('dateFormat');

      //luo.chunxiang@eisoo.com
      var format = config.get('dateFormat');
      var lang = window.localStorage.lang;
      if (lang === 'en-us') {
        format = 'MMMM Do YYYY, HH:mm:ss.SSS';
      } else if (lang === 'zh-tw') {
        format = 'YYYY年MM月DD日, HH:mm:ss.SSS';
      } else {
        format = 'YYYY年MM月DD日, HH:mm:ss.SSS';
      }

      if (moment.isMoment(datetime)) return datetime.format(format);
      if (_.isDate(datetime)) return moment(datetime).format(format);
      return datetime;
    };
  });