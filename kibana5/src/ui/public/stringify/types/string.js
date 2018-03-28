import _ from 'lodash';
import 'ui/field_format_editor/samples/samples';
import IndexPatternsFieldFormatProvider from 'ui/index_patterns/_field_format/field_format';
export default function StringFormatProvider(Private) {
  let FieldFormat = Private(IndexPatternsFieldFormatProvider);


  _.class(_String).inherits(FieldFormat);
  function _String(params) {
    _String.Super.call(this, params);
  }

  _String.id = 'string';
  _String.title = 'String';
  _String.fieldType = [
    'number',
    'boolean',
    'date',
    'ip',
    'attachment',
    'geo_point',
    'geo_shape',
    'string',
    'murmur3',
    'unknown',
    'conflict'
  ];

  _String.paramDefaults = {
    transform: false
  };

  _String.editor = require('ui/stringify/editors/string.html');

  let tyfNone;
  let tyfUpperCase;
  let tyfLowerCase;
  let tyfTitleCase;
  let tyfShortDots;
  let tyfBase64Decode;
  let lang =  window.localStorage.lang;
  if(lang === 'en-us') {
    tyfNone = '- none -';
    tyfUpperCase = 'Upper Case';
    tyfLowerCase = 'Lower Case';
    tyfTitleCase = 'Title Case';
    tyfShortDots = 'Short Dots';
    tyfBase64Decode = 'Base64 Decode';
  }else if(lang === 'zh-cn') {
    tyfNone = '- 无 -';
    tyfUpperCase = '大写';
    tyfLowerCase = '小写';
    tyfTitleCase = '标题示例';
    tyfShortDots = '短点';
    tyfBase64Decode = 'Base64解码';
  }else {
    tyfNone = '- 無 -';
    tyfUpperCase = '大寫';
    tyfLowerCase = '小寫';
    tyfTitleCase = '標題示例 ';
    tyfShortDots = '短點';
    tyfBase64Decode = 'Base64解碼';
  }
  _String.transformOpts = [
      { id: false, name: tyfNone },
      { id: 'lower', name: tyfLowerCase },
      { id: 'upper', name: tyfUpperCase },
      { id: 'title', name: tyfTitleCase },
      { id: 'short', name: tyfShortDots },
      { id: 'base64', name: tyfBase64Decode}
  ];

  _String.sampleInputs = [
    'A Quick Brown Fox.',
    'STAY CALM!',
    'com.organizations.project.ClassName',
    'hostname.net',
    'SGVsbG8gd29ybGQ='
  ];

  _String.prototype._base64Decode = function (val) {
    try {
      return window.atob(val);
    } catch (e) {
      return _.asPrettyString(val);
    }
  };

  _String.prototype._toTitleCase = function (val) {
    return val.replace(/\w\S*/g, txt => { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  };

  _String.prototype._convert = function (val) {
    switch (this.param('transform')) {
      case 'lower': return String(val).toLowerCase();
      case 'upper': return String(val).toUpperCase();
      case 'title': return this._toTitleCase(val);
      case 'short': return _.shortenDottedString(val);
      case 'base64': return this._base64Decode(val);
      default: return _.asPrettyString(val);
    }
  };

  return _String;
};
