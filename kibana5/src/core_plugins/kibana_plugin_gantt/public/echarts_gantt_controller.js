import echarts from 'echarts/dist/echarts.min';
import 'echarts/lib/chart/pie';
import 'plugins/kibana_plugin_gantt/echarts_gantt.css';
import _ from 'lodash';
import $ from 'jquery';
var module = require('ui/modules').get('kibana_plugin_gantt');

module
  .controller('EchartsGanttController', function ($scope, $element, $filter, $rootScope, $window, $http, Private, Notifier, $interval, $translate) {
    $rootScope.arGantt = true;
    var tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));
    var notify = new Notifier({location: 'kibana_plugin_echarts/EchartsGanttController'});
    //初次进来的时候，没填，都为空
    if (!$scope.vis.aggs[1].params.start_times && !$scope.vis.aggs[1].params.end_times) {
      return;
    }
    //watchMulti esResponse产生的数据
    let arCategory = [];//y轴显示数据
    let arStartTime = [];//起始时间
    let arCategoryAll = [];//整理好的JSON数据 {category:"tyf",startTime:"2015-02-08T08:39:58.000Z",stopTime:"2015-02-22T08:39:58.000Z"}
    //handlerData产生的数据
    let actualBase = [];//透明部分，即开始时间的集合
    let actualData = [];//有颜色部分，即结束时间的集合
    let max = 0;
    let mychart = echarts.init($element.get(0));
    let option = {
      grid: {
        bottom: 50,
        top: 10,
        right: 20
      },
      tooltip: {
        trigger: 'item'
      },
      xAxis: [
        {
          nameLocation: 'middle',
          nameTextStyle: {
            color: '#848e96',
            fontWeight: 'bolder'
          },
          nameGap: 35,
          type: 'time',
          splitNumber: 9,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#b9b9b9'
            }
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#767c82'
            },
            // formatter: function (value, index) {
            //   // 格式化成月/日，只在第一个刻度显示年份
            //   var date = new Date(value);
            //   var texts = [date.getFullYear(),(date.getMonth() + 1), date.getDate()];
            //   // texts.unshift(date.getYear());
            //   return texts.join('-');
            // }
          }
        },
      ],
      yAxis: [
        {
          nameLocation: 'middle',
          nameTextStyle: {
            color: '#848e96',
            fontWeight: 'bolder'
          },
          nameGap: 35,
          type: 'category',
          axisLine: {//轴的颜色
            lineStyle: {
              color: '#b9b9b9'
            }
          },
          axisLabel: {//字的颜色
            show: true,
            textStyle: {
              color: '#767c82'
            },
            formatter: function (value, index) {
              // console.log(value)
              // console.log(index)
              // 格式化成月/日，只在第一个刻度显示年份
              // var date = new Date(value);
              // var texts = [(date.getMonth() + 1), date.getDate()];
              // if (index === 0) {
              //   texts.unshift(date.getYear());
              // }
              return value;
            }
          }
        }
      ]
    };
    //自适应
    let ganttLoop = $interval(function () {
      for (let i = 0; i < $('.visualize-chart').length; i++) {
        // document.getElementsByTagName('canvas')
        $('.visualize-chart').eq(i).children().width($('.visualize-chart').eq(i).width());
        $('.visualize-chart').eq(i).children().height($('.visualize-chart').eq(i).height());
        mychart.resize();
      }
    }, 1000);
    //取消定时器
    $scope.$on('$destroy', function () {
      $interval.cancel(ganttLoop);
      $rootScope.arGantt = false;
    });
    $scope.$watch('vis.params.arCategoryGantt', function (obj) {
      if (!$scope.vis.params.arFirstGanttFlag && $scope.vis.params.arCategoryGantt.change) {
        handlerData(obj.value);
        createGantt(obj.value);
        $scope.vis.params.arCategorySortByTimeFlag = false;
      }
    });
    $scope.$watch('vis.params.arCategorySortByTime', function (value) {
      //为时间排序的时候，value才有值，而且要保证每次只能进去一次arCategorySortByTimeFlag = true，防止无限循环
      if (value.length && !$scope.vis.params.arCategorySortByTimeFlag) {
        handlerData(value);
        createGantt(value);
        $scope.vis.params.arCategorySortByTimeFlag = true;
      }
    });
    $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
      if (!resp) {
        return;
      }
      if (!resp.hits.total) {
        return;
      }
      if (resp.aggregations) {
        for (let buckets in resp.aggregations) {
          if (!resp.aggregations[buckets].buckets.length) {
            return;
          }
        }
      }
      //标记是否要进入watch 'vis.params.arCategorySortByTime'
      $scope.vis.params.arCategorySortByTimeFlag = false;
      //标记是否要进入watch 'vis.params.arCategoryGantt'
      $scope.vis.params.arFirstGanttFlag = false;
      //记录当前的displayName
      $scope.fieldDisplayName = $scope.vis.aggs[0].params.field.displayName;


      let aggregations = resp.aggregations;
      //获取到数据后让这些参数都变为空
      arCategory = [];
      arStartTime = [];
      arCategoryAll = [];

      let arCategoryFlag = 0;
      let arStartTimeFlag = 0;
      //递归，将获取到的数据转换为需要的格式
      function getResBucket(aggregations) {
        for (let aggObj in aggregations) {
          for (let buckets in aggregations[aggObj]) {
            if (buckets === 'buckets') {
              let aggBuckets = aggregations[aggObj][buckets];
              for (let i = 0; i < aggBuckets.length; i++) {
                if (aggObj === '1') {
                  arCategoryFlag++;
                  arCategory.push(aggBuckets[i].key);
                }
                if (aggObj === '2') {
                  arStartTimeFlag++;
                  arStartTime.push(aggBuckets[i].key);
                }
                if (aggObj === '3') {
                  //echart的bar图对时间格式没有要求，内部可以自己转换
                  let start = new Date(arStartTime[arStartTimeFlag - 1]).getTime();
                  let stop = new Date(aggBuckets[i].key).getTime();
                  //数据里面保存样式，这样可以在界面显示的时候，满足开始时间<时间轴开始时间；结束时间>时间轴结束时间，数据截取。
                  //且鼠标浮上去的时候，显示实际的时间
                  let curStart = {
                    ganttStartTime: arStartTime[arStartTimeFlag - 1],
                    ganttStopTime: aggBuckets[i].key,
                    value: arStartTime[arStartTimeFlag - 1],
                  };
                  let curStop = {
                    ganttStartTime: arStartTime[arStartTimeFlag - 1],
                    ganttStopTime: aggBuckets[i].key,
                    value: aggBuckets[i].key,
                  };
                  if (stop > start) {//结束时间必须大于开始时间
                    if (stop > $rootScope.ganttTimeRange.stop) {//结束时间大于时间轴，结束时间改为时间轴最大值
                      curStop.value = $rootScope.ganttTimeRange.stop;
                      curStop.itemStyle = {
                        normal: {
                          borderWidth: 1,
                          borderType: 'dashed',
                          borderColor: '#000'
                        }
                      };
                    }
                    if (start < $rootScope.ganttTimeRange.start) {
                      curStart.value = $rootScope.ganttTimeRange.start;
                      curStop.itemStyle = {
                        normal: {
                          borderWidth: 1,
                          borderType: 'dashed',
                          borderColor: '#000'
                        }
                      };
                    }
                    arCategoryAll.push({
                      category: arCategory[arCategoryFlag - 1],
                      startTime: curStart,
                      stopTime: curStop
                    });
                  }
                }
                getResBucket(aggBuckets[i]);
              }
            }
          }
        }
      }

      getResBucket(aggregations);
      arCategory = [];//因为要过滤结束时间小于开始时间的值，所以arCategory给其重新赋值
      for (var i = 0; i < arCategoryAll.length; i++) {
        if (arCategory.indexOf(arCategoryAll[i].category) === -1) {
          arCategory.push(arCategoryAll[i].category);
        }
      }
      $scope.vis.params.arCategory = arCategory;//为了给visualize_legend.js里面传递数据
      if (!arCategory.length) {
        handlerData(arCategory);
        createGantt(arCategory);
      } else if (arCategory.length) {
        if ($scope.vis.params.arCategoryGantt.change) {
          handlerData($scope.vis.params.arCategoryGantt.value);
          createGantt($scope.vis.params.arCategoryGantt.value);
        } else {
          handlerData(arCategory);
          createGantt(arCategory);
        }
      }

    });
    //对获取到的数据进行处理，得到gantt里面需要的数据actualBase，actualData
    function handlerData(arCategory) {
      if (!arCategory.length) {
        actualBase = [];
        actualData = [];
        return;
      }
      let actualStart = [];
      let actualStop = [];
      let actualName = [];
      //将arCategoryAll整理好的数据进行分类，把相同category放在一起
      for (var i = 0; i < arCategory.length; i++) {
        actualStart[i] = [];
        actualStop[i] = [];
        actualName[i] = [];
        let z = 0;
        for (var j = 0; j < arCategoryAll.length; j++) {
          if (arCategory[i] === arCategoryAll[j].category) {
            actualStart[i][z] = arCategoryAll[j].startTime;
            actualStop[i][z] = arCategoryAll[j].stopTime;
            actualName[i][z] = arCategoryAll[j].category;
            z++;
          }
        }
      }
      //获取当前的最大值，即包含job.keyWord里面的日志的最多条数，在图标中显示的为一个类目显示的条数
      max = 0;
      for (let i = 0; i < actualStart.length; i++) {
        if (max <= actualStart[i].length) {
          max = actualStart[i].length;
        }
      }
      //获取到的actualBase,actualData为甘特图表中的series数组里面data所需要的值
      for (let i = 0; i < max; i++) {
        actualBase[i] = [];
        actualData[i] = [];
        for (let j = 0; j < arCategory.length; j++) {
          if (actualStart[j][i] === undefined) {
            actualBase[i][j] = '-';
            actualData[i][j] = '-';
          } else {
            actualBase[i][j] = actualStart[j][i];
            actualData[i][j] = actualStop[j][i];
          }
        }
      }
      if ($scope.vis.aggs[0].params.orderBy === '_time') {
        $scope.vis.params.arCategorySortByTime = [];
        let actualBasetime = [];//将起始时间和arCategory对应起来放在actualBasetime里面
        if (!actualBase[0]) {
          return;
        }
        for (let i = 0; i < actualBase[0].length; i++) {
          actualBasetime.push({
            name: arCategory[i],
            time: Date.parse(actualBase[0][i])
          });
        }
        //actualBasetime按time排序
        if ($scope.vis.aggs[0].params.order.val === 'asc') {//升序
          actualBasetime.sort(function (a, b) {
            return b.time - a.time;//从大到小
          });
        } else {
          actualBasetime.sort(function (a, b) {//降序
            return a.time - b.time;//从小到大
          });
        }
        //按time排序好的arCategory放在actualBasetime
        actualBasetime.map(function (obj) {
          $scope.vis.params.arCategorySortByTime.push(obj.name);
        });
      }
    }

    //生成echart的gantt
    function createGantt(arCategory) {
      option.xAxis[0].min = $rootScope.ganttTimeRange.start;//X轴开始时间
      option.xAxis[0].max = $rootScope.ganttTimeRange.stop;//X轴结束时间
      option.xAxis[0].name = $scope.vis.aggs[1].params.customLabel;//显示XY轴对应的名字
      option.yAxis[0].name = $scope.vis.aggs[0].params.customLabel;
      option.series = [];
      //平铺和堆叠模式
      if ($scope.vis.params.graph === 'tiled') {
        for (let i = 0; i < max; i++) {//平铺，同一个条数据里面的开始时间和结束时间stack相同
          option.series[i] = {
            barMinHeight: 2,
            type: 'bar',
            stack: `透明${i}`,
            itemStyle: {
              normal: {
                barBorderColor: 'rgba(0,0,0,0)',
                color: 'rgba(0,0,0,0)'
              },
              emphasis: {
                barBorderColor: 'rgba(0,0,0,0)',
                color: 'rgba(0,0,0,0)'
              }
            },
            label: {
              normal: {
                show: false
              }
            },
            data: actualBase[i]
          };
        }
        for (let i = 0; i < max; i++) {
          option.series[i + max] = {
            barMinHeight: 2,
            type: 'bar',
            stack: `透明${i}`,
            label: {
              normal: {
                show: false
              }
            },
            data: actualData[i]
          };
        }
      } else if ($scope.vis.params.graph === 'stack') {//堆叠
        for (let i = 0; i < max; i++) {//堆叠，所有数据里面的开始时间和结束时间stack相同
          option.series[i * 2] = {
            barMinHeight: 2,
            type: 'bar',
            stack: `透明`,
            itemStyle: {
              normal: {
                barBorderColor: 'rgba(0,0,0,0)',
                color: 'rgba(0,0,0,0)'
              },
              emphasis: {
                barBorderColor: 'rgba(0,0,0,0)',
                color: 'rgba(0,0,0,0)'
              }
            },
            label: {
              normal: {
                show: false
              }
            },
            data: actualBase[i]
          };
          option.series[i * 2 + 1] = {
            barMinHeight: 2,
            type: 'bar',
            stack: `透明`,
            label: {
              normal: {
                show: false
              }
            },
            data: actualData[i]
          };
        }
      }

      //获取时间的天，小时，分钟，秒
      function toTime(second) {
        let sss = second % 1000;
        second = second / 1000;
        let result;
        let s = parseInt(second % 60);
        let m = parseInt(second / 60) % 60;
        let h = parseInt(second / 3600) % 24;
        let d = parseInt(second / (3600 * 24));
        if (d !== 0) {
          result = d + $translate.instant('天') + h + $translate.instant('小时') + m + $translate.instant('分钟') + s + $translate.instant('秒') + sss + $translate.instant('毫秒');
        }
        else if (h !== 0) {
          result = h + $translate.instant('小时') + m + $translate.instant('分钟') + s + $translate.instant('秒') + sss + $translate.instant('毫秒');
        }
        else if (m !== 0) {
          result = m + $translate.instant('分钟') + s + $translate.instant('秒') + sss + $translate.instant('毫秒');
        }
        else {
          result = s + $translate.instant('秒') + sss + $translate.instant('毫秒');
        }
        return result;
      }

      //计算提示信息应该显示的值，主要看seriesIndex，name对应的数组里面的那个值
      option.tooltip.formatter = function (params) {
        if (params.color === 'rgba(0,0,0,0)') {
          return '';
        } else {
          let startTime = params.data.ganttStartTime;//开始时间
          let stopTime = params.data.ganttStopTime;//结束时间
          let dataDiff = toTime(stopTime - startTime);//获取到对应的开始时间和结束时间之间的天，小时，分钟，秒
          //将日期格式化为YYYY-MM-DD hh:mm:ss
          let date0 = $filter('date')(startTime, 'yyyy-MM-dd HH:mm:ss.sss');
          let date1 = $filter('date')(stopTime, 'yyyy-MM-dd HH:mm:ss.sss');
          let result =
            $translate.instant('名称：') + params.name + '<br/>' +
            $translate.instant(' 时间跨度：') + dataDiff + '<br/>' +
            $translate.instant(' 开始时间：') + date0 + '<br/>' +
            $translate.instant(' 结束时间：') + date1;
          return result;
        }
      };
      let gridx = 0;
      // GBK字符集实际长度计算
      function getStrLeng(str) {
        let realLength = 0;
        let len = str.length;
        let charCode = -1;
        for (let i = 0; i < len; i++) {
          charCode = str.charCodeAt(i);
          if (charCode >= 0 && charCode <= 128) {
            realLength += 1;
          } else {
            // 如果是中文则长度加2
            realLength += 2;
          }
        }
        return realLength;
      }

      for (let i = 0; i < arCategory.length; i++) {
        let arLen = getStrLeng(arCategory[i].toString());
        if (arLen > gridx) {
          gridx = arLen;
        }
      }
      option.grid.x = 20 + gridx * 8;//距离Y轴距离
      option.yAxis[0].nameGap = 10 + gridx * 8;
      option.yAxis[0].data = arCategory;//Y轴的数据
      mychart.setOption(option, true);
    }

  });
