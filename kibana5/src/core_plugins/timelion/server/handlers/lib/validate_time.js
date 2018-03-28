var parseDateMath = require('../../lib/date_math.js');
var toMS = require('../../lib/to_milliseconds.js');

module.exports = function validateTime(time, tlConfig) {
  var span = parseDateMath(time.to, true) - parseDateMath(time.from);
  var interval = toMS(time.interval);
  var bucketCount = span / interval;
  var maxBuckets = tlConfig.settings['timelion:max_buckets'];
  //luo.chunxiang@eisoo.com
  // $translatePartialLoader.addPart('../plugins/timelion');
  // $translate.refresh();
  //var lang =  window.localStorage.lang;
  if (bucketCount > maxBuckets) {
    throw new Error('Max buckets exceeded: ' +
      Math.round(bucketCount) + ' of ' + maxBuckets + ' allowed. ' +
      'Choose a larger interval or a shorter time span');
  }
  return true;
};
