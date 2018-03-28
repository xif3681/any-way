import _ from 'lodash';
import angular from 'angular';

//luochunxiang@eisoo.com
var lcxError;
var lang = window.localStorage.lang;
var CourierAttempted;
var AllOrPart;
var RequestToElasticsearch;
var FailedToGet;
var shardsFailed;
var FailedToStore;
var Field;
var FieldIsDefined;
var isRestricted;
var foundItWhile;
var ElasticsearchCache;
var The;
var fieldWasNot;
var fieldAlready;
var IndexPatternCconfigured;
var DefineAtLeast;
var PleaseSpecify;
var NoResultsFound;
var NoResultsDisplayed;
var ValuesLessThan;
var InWiggleMode;
var PersistedStateError;
var CouldNotLocate;
var search;
var visualization;
if (lang === 'en-us') {
  lcxError = 'This container is too small to render the visualization';
  CourierAttempted = 'Courier attempted to start a query before the previous had finished.';
  AllOrPart = 'All or part of your request has timed out. The data shown may be incomplete.';
  RequestToElasticsearch = 'Request to Elasticsearch failed: ';
  FailedToGet = 'Failed to get the doc: ';
  shardsFailed = 'shards failed.';
  FailedToStore = 'Failed to store document changes due to a version conflict.';
  Field = 'Failed';
  FieldIsDefined = 'is defined with at least two different types in indices matching the pattern';
  isRestricted = 'is a restricted field name,found it while attempting to fetch mapping for index pattern: ';
  foundItWhile  = ',found it while attempting to fetch mapping for index pattern: ';
  ElasticsearchCache = 'A Elasticsearch cache write has failed';
  The = 'The ';
  fieldWasNot = ' field was not found in the cached mappings';
  fieldAlready = ' field already exists in this mapping';
  IndexPatternCconfigured = 'IndexPattern\'s configured pattern does not match any indices';
  DefineAtLeast = 'Define at least one index pattern to continue';
  PleaseSpecify = 'Please specify a default index pattern';
  NoResultsFound = 'No results found';
  NoResultsDisplayed = 'No results displayed because all values equal 0';
  ValuesLessThan = 'Values less than 1 cannot be displayed on a log scale';
  InWiggleMode = 'In wiggle mode the area chart requires ordered values on the x-axis.'
  + ' Try using a Histogram or Date Histogram aggregation.';
  PersistedStateError = 'PersistedState Error';
  CouldNotLocate = 'Could not locate that ';
  visualization = 'visualization';
  search = 'search';

} else if (lang === 'zh-tw') {
  lcxError = '此容器太小，不足以呈現視覺化。';
  CourierAttempted = 'Courier attempted to start a query before the previous had finished.';
  AllOrPart = '由於全部或部分的請求超時，因此顯示的資料可能是不完整的。';
  RequestToElasticsearch = '請求Elasticsearch失敗：';
  FailedToGet = '文檔獲取失敗：';
  shardsFailed = '分片失敗。';
  FailedToStore = '由於版本衝突，所以無法存儲文檔更改。';
  Field = '字段';
  FieldIsDefined = '在索引與模式匹配的過程中，欄位被定義為了至少兩種不同的類型。';
  isRestricted = '是一個受限欄位名';
  foundItWhile  = '，在嘗試獲取索引模式的映射時發現了它：';
  ElasticsearchCache = 'Elasticsearch緩存寫入失敗。';
  The = '这個';
  fieldWasNot = '欄位在緩存映射中找不到';
  fieldAlready = '欄位此映射中已存在';
  IndexPatternCconfigured = '索引模式的已配置模式不匹配任何索引';
  DefineAtLeast = '請定義至少一個索引模式以繼續操作';
  PleaseSpecify = '請指定預設索引模式';
  NoResultsFound = '未找到結果';
  NoResultsDisplayed = '未顯示結果，因為所有值都等於0';
  ValuesLessThan = '小於1的值不能以對數刻度顯示';
  InWiggleMode = '在擺動模式下，面積圖的x軸上需要順序資料。您可以嘗試使用柱狀圖或日期柱狀圖聚合。';
  PersistedStateError = '持續狀態錯誤';
  CouldNotLocate = '找不到該';
  visualization = '視覺化';
  search = '搜索';
} else {
  lcxError = '此容器太小，不足以呈现可视化。';
  CourierAttempted = 'Courier attempted to start a query before the previous had finished.';
  AllOrPart = '由于全部或部分的请求超时，因此显示的数据可能是不完整的。';
  RequestToElasticsearch = '请求Elasticsearch失败：';
  FailedToGet = '文档获取失败： ';
  shardsFailed = '分片失败。';
  FailedToStore = '由于版本冲突，所以无法存储文档更改。';
  Field = '字段';
  FieldIsDefined = '在索引与模式匹配的过程中，字段被定义为了至少两种不同的类型';
  isRestricted = '是一个受限字段名';
  foundItWhile  = '，在尝试获取索引模式的映射时发现了它';
  ElasticsearchCache = 'Elasticsearch缓存写入失败。';
  The = '这个';
  fieldWasNot = '字段在缓存映射中找不到';
  fieldAlready = '字段此映射中已存在';
  IndexPatternCconfigured = '索引模式的已配置模式不匹配任何索引';
  DefineAtLeast = '请定义至少一个索引模式以继续操作';
  PleaseSpecify = '请指定默认索引模式';
  NoResultsFound = '未找到结果';
  NoResultsDisplayed = '未显示结果，因为所有值都等于0';
  ValuesLessThan = '小于1的值不能以对数刻度显示';
  InWiggleMode = '在摆动模式下，面积图的x轴上需要顺序数据。您可以尝试使用柱状图或日期柱状图聚合。';
  PersistedStateError = '持续状态错误';
  CouldNotLocate = '找不到该';
  visualization = '可视化';
  search = '搜索';
}

//
var typeChange = function (type) {
  var typeC;
  switch (type) {
    case 'search':
      typeC = '搜索';
      break;
    case 'visualization':
      typeC = visualization;
      break;
    default:
      break;
  }
  return typeC;
};
const canStack = (function () {
  const err = new Error();
  return !!err.stack;
}());

const errors = {};

// abstract error class
function KbnError(msg, constructor,$translate) {
  this.message = msg;

  // var lang = $translate.use();
  // console.log(lang);
  Error.call(this, this.message);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, constructor || KbnError);
  } else if (canStack) {
    this.stack = (new Error()).stack;
  } else {
    this.stack = '';
  }
}
errors.KbnError = KbnError;
_.class(KbnError).inherits(Error);

/**
 * If the error permits, propagate the error to be rendered on screen
 * @param handler the handlers that can render the error message to the screen.
 */
KbnError.prototype.displayToScreen = function (handler) {
  throw this;
};

/**
 * HastyRefresh error class
 * @param {String} [msg] - An error message that will probably end up in a log.
 */
errors.HastyRefresh = function HastyRefresh() {
  KbnError.call(this,
     CourierAttempted,
    errors.HastyRefresh);
};
_.class(errors.HastyRefresh).inherits(KbnError);

/**
 * SearchTimeout error class
 */
errors.SearchTimeout = function SearchTimeout() {
  KbnError.call(this,
    AllOrPart,
    errors.SearchTimeout);
};
_.class(errors.SearchTimeout).inherits(KbnError);

/**
 * Request Failure - When an entire mutli request fails
 * @param {Error} err - the Error that came back
 * @param {Object} resp - optional HTTP response
 */
errors.RequestFailure = function RequestFailure(err, resp) {
  err = err || false;

  KbnError.call(this,
    RequestToElasticsearch + angular.toJson(resp || err.message),
    errors.RequestFailure);

  this.origError = err;
  this.resp = resp;
};
_.class(errors.RequestFailure).inherits(KbnError);

/**
 * FetchFailure Error - when there is an error getting a doc or search within
 *  a multi-response response body
 * @param {String} [msg] - An error message that will probably end up in a log.
 */
errors.FetchFailure = function FetchFailure(resp) {
  KbnError.call(this,
    FailedToGet + angular.toJson(resp),
    errors.FetchFailure);

  this.resp = resp;
};
_.class(errors.FetchFailure).inherits(KbnError);

/**
 * ShardFailure Error - when one or more shards fail
 * @param {String} [msg] - An error message that will probably end up in a log.
 */
errors.ShardFailure = function ShardFailure(resp) {
  KbnError.call(this, resp._shards.failed + ' of ' + resp._shards.total + ' shards failed.',
    errors.ShardFailure);

  this.resp = resp;
};
_.class(errors.ShardFailure).inherits(KbnError);


/**
 * A doc was re-indexed but it was out of date.
 * @param {Object} resp - The response from es (one of the multi-response responses).
 */
errors.VersionConflict = function VersionConflict(resp) {
  KbnError.call(this,
     FailedToStore,
    errors.VersionConflict);

  this.resp = resp;
};
_.class(errors.VersionConflict).inherits(KbnError);


/**
 * there was a conflict storing a doc
 * @param {String} field - the fields which contains the conflict
 */
errors.MappingConflict = function MappingConflict(field) {
  KbnError.call(this,
     Field + field + FieldIsDefined,
    errors.MappingConflict);
};
_.class(errors.MappingConflict).inherits(KbnError);

/**
 * a field mapping was using a restricted fields name
 * @param {String} field - the fields which contains the conflict
 */
errors.RestrictedMapping = function RestrictedMapping(field, index) {
  let msg = field + isRestricted;
  if (index) msg += foundItWhile + index;

  KbnError.call(this, msg, errors.RestrictedMapping);
};
_.class(errors.RestrictedMapping).inherits(KbnError);

/**
 * a non-critical cache write to elasticseach failed
 */
errors.CacheWriteFailure = function CacheWriteFailure() {
  KbnError.call(this,
    ElasticsearchCache,
    errors.CacheWriteFailure);
};
_.class(errors.CacheWriteFailure).inherits(KbnError);

/**
 * when a field mapping is requested for an unknown field
 * @param {String} name - the field name
 */
errors.FieldNotFoundInCache = function FieldNotFoundInCache(name) {
  KbnError.call(this,
    The + name + fieldWasNot,
    errors.FieldNotFoundInCache);
};
_.class(errors.FieldNotFoundInCache).inherits(KbnError);

/**
 * when a mapping already exists for a field the user is attempting to add
 * @param {String} name - the field name
 */
errors.DuplicateField = function DuplicateField(name) {
  KbnError.call(this,
   The + '"' + name + '"' + fieldAlready,
    errors.DuplicateField);
};
_.class(errors.DuplicateField).inherits(KbnError);

/**
 * A saved object was not found
 * @param {String} field - the fields which contains the conflict
 */
errors.SavedObjectNotFound = function SavedObjectNotFound(type, id) {
  this.savedObjectType = type;
  this.savedObjectId = id;
  const idMsg = id ? ' (id: ' + id + ')' : '';
  KbnError.call(this,
    CouldNotLocate + typeChange(type) + idMsg,
    errors.SavedObjectNotFound);
};
_.class(errors.SavedObjectNotFound).inherits(KbnError);

/**
 * Tried to call a method that relies on SearchSource having an indexPattern assigned
 */
errors.IndexPatternMissingIndices = function IndexPatternMissingIndices(type) {
  KbnError.call(this,
    IndexPatternCconfigured,
    errors.IndexPatternMissingIndices);
};
_.class(errors.IndexPatternMissingIndices).inherits(KbnError);

/**
 * Tried to call a method that relies on SearchSource having an indexPattern assigned
 */
errors.NoDefinedIndexPatterns = function NoDefinedIndexPatterns(type) {
  KbnError.call(this,
    DefineAtLeast,
    errors.NoDefinedIndexPatterns);
};
_.class(errors.NoDefinedIndexPatterns).inherits(KbnError);


/**
 * Tried to load a route besides management/kibana/index but you don't have a default index pattern!
 */
errors.NoDefaultIndexPattern = function NoDefaultIndexPattern(type) {
  KbnError.call(this,
     PleaseSpecify,
    errors.NoDefaultIndexPattern);
};
_.class(errors.NoDefaultIndexPattern).inherits(KbnError);


errors.PersistedStateError = function PersistedStateError(msg) {
  KbnError.call(this,
  lcxError,
  errors.ContainerTooSmall);
};
//
// lcx
// errors.PersistedStateError = function PersistedStateError(msg) {
//   KbnError.call(this,
//   ' ',
//   errors.ContainerTooSmall);
// };
_.class(errors.PersistedStateError).inherits(KbnError);


/**
 * UI Errors
 */
errors.VislibError = class VislibError extends KbnError {
  constructor(message) {
    super(message);
  }

  displayToScreen(handler) {
    handler.error(this.message);
  }
};


// errors.ContainerTooSmall = class ContainerTooSmall extends errors.VislibError {
//   constructor() {
//     super('This container is too small to render the visualization');
//   }
// };
//lcx
errors.ContainerTooSmall = class ContainerTooSmall extends errors.VislibError {
  constructor() {
    super(' ');
  }

};
errors.InvalidWiggleSelection = class InvalidWiggleSelection extends errors.VislibError {
  constructor() {
    super('In wiggle mode the area chart requires ordered values on the x-axis. Try using a Histogram or Date Histogram aggregation.');
  }
};


errors.PieContainsAllZeros = class PieContainsAllZeros extends errors.VislibError {
  constructor() {
    super('No results displayed because all values equal 0.');
  }
};


errors.InvalidLogScaleValues = class InvalidLogScaleValues extends errors.VislibError {
  constructor() {
    super('Values less than 1 cannot be displayed on a log scale');
  }
};


errors.StackedBarChartConfig = class StackedBarChartConfig extends errors.VislibError {
  constructor(message) {
    super(message);
  }
};

/**
 * error thrown when user tries to render an chart with less
 * than the required number of data points
 * @param {String} message - the message to provide with the error
 */
errors.NotEnoughData = class NotEnoughData extends errors.VislibError {
  constructor(message) {
    super(message);
  }
};

errors.NoResults = class NoResults extends errors.VislibError {
  constructor() {
    super('No results found');
  }
};






export default errors;
