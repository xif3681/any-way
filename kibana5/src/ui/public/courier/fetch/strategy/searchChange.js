define(function (require) {
  const _ = require('lodash');

  var _arSearch = {};
  /**
   * 状态监控
   */
  //获取到query数组
  let getMonitorMatch = function (bodyAggs) {
    let arBodyAggsMatchArr = [];
    let arBodyAggs = bodyAggs;
    for (let aggObj in arBodyAggs) {
      for (let monitors in arBodyAggs[aggObj]) {
        let arBodyAggsMatch = arBodyAggs[aggObj][monitors].match;
        for (let matchObj in arBodyAggsMatch) {
          for(let matchKey in arBodyAggsMatch[matchObj]) {
            if(matchKey) {
              arBodyAggsMatchArr.push(arBodyAggsMatch[matchObj]);
            }
          }
        }
      }
    }
    return arBodyAggsMatchArr;
  };
  //添加match到body里面
  let mapMatch = function (bodyArrI, obj) {
    for (let aggObj in bodyArrI.query) {
      for (let aggObjChild in bodyArrI.query[aggObj]) {
        if (aggObjChild === 'must') {
          let metricRangeObj = bodyArrI.query[aggObj][aggObjChild];
          metricRangeObj[metricRangeObj.length] = {match: obj};
          // console.log(metricRangeObj)
        }
      }
    }
    bodyArrI.aggs = {};
    return bodyArrI;
  };
  _arSearch.changeMonitorQuery = function (body, bodyAggs) {
    let bodyArr = [];
    let monitorMatchArr = getMonitorMatch(bodyAggs);
    monitorMatchArr.map((obj, i)=> {
      let bodyClone = _.cloneDeep(body);//每次循环都在‘原来的body’里面添加新的值
      bodyArr[i] = mapMatch(bodyClone, obj);
    });
    return bodyArr;
  };
  return _arSearch;
}
);




