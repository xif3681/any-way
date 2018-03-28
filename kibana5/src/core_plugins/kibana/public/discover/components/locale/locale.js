define(function (require) {
  const _ = require('lodash');

  var lang = window.localStorage.lang || 'zh-cn';

  var __ = {};

  if (lang === 'zh-cn') {
    __.displayMode = [{
      id: 'ListMode',
      value: '列表模式'
    }, {
      id: 'OriginalLog',
      value: '原始日志'
    }];
    __.downloadMode = [{
      id: 'list',
      value: '下载列表内容'
    }, {
      id: 'origin',
      value: '下载原始日志'
    }, {
      id: 'info',
      value: '离线下载管理'
    }];
  } else if (lang === 'zh-tw') {
    __.displayMode = [{
      id: 'ListMode',
      value: '清單模式'
    }, {
      id: 'OriginalLog',
      value: '原始日誌'
    }];
    __.downloadMode = [{
      id: 'list',
      value: '下載清單內容'
    }, {
      id: 'origin',
      value: '下載原始日誌'
    }, {
      id: 'info',
      value: '離線下載管理'
    }];

  } else {
    __.displayMode = [{
      id: 'ListMode',
      value: 'List mode'
    }, {
      id: 'OriginalLog',
      value: 'Raw log'
    }];
    __.downloadMode = [{
      id: 'list',
      value: 'Download the event list'
    }, {
      id: 'origin',
      value: 'Download the raw log'
    }, {
      id: 'info',
      value: 'Offline Download Management'
    }];

  }

  return __;
});

