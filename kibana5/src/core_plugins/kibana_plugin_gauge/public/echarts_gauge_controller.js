import echarts from 'echarts/dist/echarts.min';
import 'echarts/lib/chart/pie';
import 'plugins/kibana_plugin_gauge/echarts_gauge.css';
import _ from 'lodash';
import $ from 'jquery';
var module = require('ui/modules').get('kibana_plugin_gauge');
module
  .controller('EchartsGaugeController', function ($scope, $interval, $element, $rootScope, Private, Notifier) {
    let gaugeWidth = $('.visualize-chart').width();
    let gaugeHeight = $('.vis-editor-content').height();
    $('.visualize-chart').css('overflow-x', 'hidden');
    $scope.gaugeStyle = {
      'width': gaugeWidth,
      'height': gaugeHeight + 125
    };
    var tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));
    var notify = new Notifier({location: 'kibana_plugin_echarts/EchartsGaugeController'});

    // 基于准备好的dom，初始化echarts实例
    var mychart = echarts.init($element.get(0));
    //用于使chart自适应高度和宽度
    window.onresize = function () {
      mychart.resize();
    };

    // 指定图表的配置项和数据
    let option = {
      tooltip: {
        show: false,
        formatter: '{a} <br/>{b} : {c}%'
      },
      series: [
        {
          name: '业务指标',
          type: 'gauge',
          min: '',
          max: '',
          splitNumber: 5,
          detail: {formatter: '{value}'},
          data: [{value: 50, name: '完成率'}],
          axisLabel: {
            show: true,
            formatter: function (value) {
              return Math.floor(value);
            }
          },
          axisLine: {
            lineStyle: {
              color: [[0.2, '#91c7ae'], [0.8, '#63869e'], [1, '#c23531']],
              width: 20
            }
          }
        }
      ]
    };
    //仪表盘拖动框的时候自适应
    let gaugeLoop = $interval(function () {
      for (let i = 0; i < $('.visualize-chart').length; i++) {
        $('.visualize-chart').eq(i).children().width($('.visualize-chart').eq(i).width());
        $('.visualize-chart').eq(i).children().height($('.visualize-chart').eq(i).height());
        mychart.resize();
      }
    }, 1000);
    $scope.$on('$destroy', function () {
      $interval.cancel(gaugeLoop);
    });
    //用来存储获取到的值
    const metrics = $scope.metrics = [];

    function isInvalid(val) {
      return _.isUndefined(val) || _.isNull(val) || _.isNaN(val);
    }

    // 范围输入变化，计算color: [[0.2, '#91c7ae'], [0.8, '#63869e'], [1, '#c23531']]的第一个参数，小数显示
    let changeFromTo = function (to) {
      return ((to - $scope.vis.params.minGauge) / ($scope.vis.params.maxGauge - $scope.vis.params.minGauge));
    };
    //颜色,范围改变
    let changeFromToRanges = function () {
      switch ($scope.vis.params.range) {
        case '1':
          $scope.vis.params.axisLine.lineStyle.color = [[1, $scope.vis.params.fromToRanges[0].color]];
          break;
        case '2':
          $scope.vis.params.axisLine.lineStyle.color = [
            [changeFromTo($scope.vis.params.fromToRanges[0].to), $scope.vis.params.fromToRanges[0].color],
            [1, $scope.vis.params.fromToRanges[1].color]
          ];
          break;
        case '3':
          $scope.vis.params.axisLine.lineStyle.color = [
            [changeFromTo($scope.vis.params.fromToRanges[0].to), $scope.vis.params.fromToRanges[0].color],
            [changeFromTo($scope.vis.params.fromToRanges[1].to), $scope.vis.params.fromToRanges[1].color],
            [1, $scope.vis.params.fromToRanges[2].color]
          ];
          break;
        case '4':
          $scope.vis.params.axisLine.lineStyle.color = [
            [changeFromTo($scope.vis.params.fromToRanges[0].to), $scope.vis.params.fromToRanges[0].color],
            [changeFromTo($scope.vis.params.fromToRanges[1].to), $scope.vis.params.fromToRanges[1].color],
            [changeFromTo($scope.vis.params.fromToRanges[2].to), $scope.vis.params.fromToRanges[2].color],
            [1, $scope.vis.params.fromToRanges[3].color]
          ];
          break;
        case '5':
          $scope.vis.params.axisLine.lineStyle.color = [
            [changeFromTo($scope.vis.params.fromToRanges[0].to), $scope.vis.params.fromToRanges[0].color],
            [changeFromTo($scope.vis.params.fromToRanges[1].to), $scope.vis.params.fromToRanges[1].color],
            [changeFromTo($scope.vis.params.fromToRanges[2].to), $scope.vis.params.fromToRanges[2].color],
            [changeFromTo($scope.vis.params.fromToRanges[3].to), $scope.vis.params.fromToRanges[3].color],
            [1, $scope.vis.params.fromToRanges[4].color]
          ];
          break;
        case '6':
          $scope.vis.params.axisLine.lineStyle.color = [
            [changeFromTo($scope.vis.params.fromToRanges[0].to), $scope.vis.params.fromToRanges[0].color],
            [changeFromTo($scope.vis.params.fromToRanges[1].to), $scope.vis.params.fromToRanges[1].color],
            [changeFromTo($scope.vis.params.fromToRanges[2].to), $scope.vis.params.fromToRanges[2].color],
            [changeFromTo($scope.vis.params.fromToRanges[3].to), $scope.vis.params.fromToRanges[3].color],
            [changeFromTo($scope.vis.params.fromToRanges[4].to), $scope.vis.params.fromToRanges[4].color],
            [1, $scope.vis.params.fromToRanges[5].color]
          ];
          break;
      }
    };

    //kibana对数据的处理
    $scope.processTableGroups = function (tableGroups) {
      tableGroups.tables.forEach(function (table, index) {
        table.columns.forEach(function (column, i) {
          let value = table.rows[0][i];
          value = isInvalid(value) ? '?' : (Math.floor(value * 100) / 100);
          if ($scope.vis.params.scale === 'original') {
            value = value;
          } else {
            value = Math.floor(changeFromTo(value) * 100 * 100) / 100;
          }
          metrics.push({
            name: column.title,
            value: value
          });

        });
        option.series[index].data = metrics;//获取的数据
        if ($scope.vis.params.scale === 'original') {
          //仪表盘样式设置
          option.series[index].detail = {formatter: '{value}'};
          option.series[index].min = $scope.vis.params.minGauge;//刻度范围最小值
          option.series[index].max = $scope.vis.params.maxGauge;//刻度范围最大值
        } else {
          //仪表盘样式设置
          option.series[index].detail = {formatter: '{value}%'};
          option.series[index].min = 0;//刻度范围最小值
          option.series[index].max = 100;//刻度范围最大值
        }
        //仪表盘刻度范围
        option.series[index].startAngle = $scope.vis.params.startAngle;
        option.series[index].endAngle = $scope.vis.params.endAngle;
        changeFromToRanges();//仪表盘划分阶段数量,颜色，范围的变化
        option.series[index].axisLine.lineStyle.color = $scope.vis.params.axisLine.lineStyle.color;//仪表盘的轴线被分成不同颜色的多段
      });
    };
    //kibana对数据的处理
    $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
      if (resp) {
        // if ($scope.vis.params.notFirstTime && !$scope.vis.params.softErrorCount) {//第一次进入
        if (!$scope.vis.params.softErrorCount) {
          metrics.length = 0;
          $scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
          // 使用刚指定的配置项和数据显示图表。
          mychart.setOption(option, true);
          mychart.resize();
          return notify.timed('Echarts Gauge Controller', resp);
        }
      }
    }, true);

  })
  .controller('EchartsGaugeEditController', function ($scope, Notifier, $timeout) {
    var notify = new Notifier({location: '仪表盘'});
    //计算当前错误的个数
    let errCount = function () {
      let errCount = $scope.$parent.$parent.visualizeEditor.errorCount();
      let count = errCount;
      for (let i = 0; i < $scope.vis.params.fromToRanges.length; i++) {
        if ($scope.vis.params.fromToRanges[i].inputerr === 'input-error' || $scope.vis.params.fromToRanges[i].to === undefined) {
          count++;
        }
      }
      if ($scope.vis.params.inputErrMin === 'input-error' || $scope.vis.params.minGauge === undefined) {
        count++;
      }
      if ($scope.vis.params.inputErrMax === 'input-error' || $scope.vis.params.maxGauge === undefined) {
        count++;
      }
      $scope.$parent.$parent.visualizeEditor.softErrorCount = function () {
        return count;
      };
      if (count !== 0) {
        $scope.vis.params.softErrorCount = true;
      } else {
        $scope.vis.params.softErrorCount = false;
      }
    };
    //点击运行按钮
    $('.navbar-btn-link').eq(0).click(function () {
      if ($scope.vis.params.inputErrMin1 === 'input-error') {
        $scope.vis.params.inputErrMin = 'input-error';
        $scope.vis.params.inputErrMin1 = '';
      } else if ($scope.vis.params.inputErrMax1 === 'input-error') {
        $scope.vis.params.inputErrMax = 'input-error';
        $scope.vis.params.inputErrMax1 = '';
      }
      errCount();
    });
    //点击取消按钮
    $('.navbar-btn-link').eq(1).click(function () {
      $scope.$parent.$parent.visualizeEditor.softErrorCount = function () {
        return 0;
      };
    });
    $scope.vis.params.inputErrMin = '';
    $scope.vis.params.inputErrMax = '';
    //初始的时候显示为选项界面
    $scope.$parent.$parent.sidebar.section = 'options';
    //计算from,to 应该显示的值
    let rangeFromTo = function (part, num) {
      let rangeNum = (($scope.vis.params.maxGauge - $scope.vis.params.minGauge) / part) * num;
      return Math.floor(rangeNum);
    };
    //最小值改变,条件不满足，标为红框，范围的第一个
    $scope.$watch('vis.params.minGauge', function () {
      if (isNaN($scope.vis.params.fromToRanges[0].to) && $scope.vis.params.fromToRanges[0].to !== undefined) {
        $scope.vis.params.flagNaN = true;
      }
      //第一次进入||min或者max都为空值后，点击下拉框，其值变为了NAN
      if (!$scope.vis.params.notFirstTime || $scope.vis.params.flagNaN) {
        if ($scope.vis.params.maxGauge <= $scope.vis.params.minGauge || $scope.vis.params.maxGauge === '') {
          $scope.vis.params.inputErrMin1 = 'input-error';
        } else {
          $scope.vis.params.inputErrMin = '';
          $scope.vis.params.inputErrMax = '';
          $scope.vis.params.inputErrMin1 = '';
          $scope.vis.params.inputErrMax1 = '';
          $scope.changeRanges();
          $timeout(function () {
            $scope.vis.params.notFirstTime = true;
            $scope.vis.params.flagNaN = false;
          }, 3000);
        }
      } else {
        $scope.vis.params.inputErrMin = '';
        $scope.vis.params.inputErrMax = '';
        $scope.vis.params.inputErrMin1 = '';
        $scope.vis.params.inputErrMax1 = '';
        if ($scope.vis.params.maxGauge <= $scope.vis.params.minGauge) {
          $scope.vis.params.inputErrMin = 'input-error';
        } else {
          $scope.vis.params.inputErrMin = '';
          $scope.vis.params.inputErrMax = '';
          $scope.vis.params.inputErrMin1 = '';
          $scope.vis.params.inputErrMax1 = '';
        }
        $scope.vis.params.fromToRanges[0].from = $scope.vis.params.minGauge;
      }
      $scope.$parent.$parent.visualizeEditor.softErrorCount = function () {
        return 0;
      };
    }, true);
    //最大值改变,条件不满足，标为红框，范围的最后一个
    $scope.$watch('vis.params.maxGauge', function () {
      if (isNaN($scope.vis.params.fromToRanges[0].to) && $scope.vis.params.fromToRanges[0].to !== undefined) {
        $scope.vis.params.flagNaN = true;
      }
      //第一次进入||min或者max都为空值后，点击下拉框，其值变为了NAN
      if (!$scope.vis.params.notFirstTime || $scope.vis.params.flagNaN) {
        if ($scope.vis.params.maxGauge <= $scope.vis.params.minGauge || $scope.vis.params.minGauge === '') {
          $scope.vis.params.inputErrMax1 = 'input-error';
        } else {
          $scope.vis.params.inputErrMin = '';
          $scope.vis.params.inputErrMax = '';
          $scope.vis.params.inputErrMin1 = '';
          $scope.vis.params.inputErrMax1 = '';
          $scope.changeRanges();
          $timeout(function () {
            $scope.vis.params.notFirstTime = true;
            $scope.vis.params.flagNaN = false;
          }, 3000);
        }
      } else {
        $scope.vis.params.inputErrMin = '';
        $scope.vis.params.inputErrMax = '';
        $scope.vis.params.inputErrMin1 = '';
        $scope.vis.params.inputErrMax1 = '';
        if ($scope.vis.params.maxGauge <= $scope.vis.params.minGauge) {
          $scope.vis.params.inputErrMax = 'input-error';
        } else {
          $scope.vis.params.inputErrMin = '';
          $scope.vis.params.inputErrMax = '';
          $scope.vis.params.inputErrMin1 = '';
          $scope.vis.params.inputErrMax1 = '';
        }
        let i = Number($scope.vis.params.range);
        $scope.vis.params.fromToRanges[i - 1].to = $scope.vis.params.maxGauge;
      }
      $scope.$parent.$parent.visualizeEditor.softErrorCount = function () {
        return 0;
      };
    }, true);
    //仪表盘刻度范围改变
    $scope.$watch('vis.params.angle', function () {
      let nowAngle = null;
      if ($scope.vis.params.angle === '360') {
        nowAngle = '359';
      } else {
        nowAngle = $scope.vis.params.angle;
      }

      let diffAngle = Math.abs(nowAngle - 180) / 2;
      if (nowAngle > 180) {
        $scope.vis.params.startAngle = 180 + diffAngle;
        $scope.vis.params.endAngle = -diffAngle;
      } else if (nowAngle <= 180) {
        $scope.vis.params.startAngle = 180 - diffAngle;
        $scope.vis.params.endAngle = diffAngle;
      }
    }, true);
    //仪表盘刻度范围,条件不满足，标为红框
    $scope.$watch('vis.params.fromToRanges', function (newValue, oldValue, scope) {
      if ($scope.vis.params.notFirstTime) {
        for (let i = 0; i < newValue.length - 1; i++) {
          $scope.vis.params.fromToRanges[i + 1].from = $scope.vis.params.fromToRanges[i].to;
          if ($scope.vis.params.fromToRanges[newValue.length - 1].to <= $scope.vis.params.fromToRanges[newValue.length - 1].from) {
            $scope.vis.params.fromToRanges[newValue.length - 2].inputerr = 'input-error';
          }
          if ($scope.vis.params.fromToRanges[0].to <= $scope.vis.params.fromToRanges[0].from) {
            $scope.vis.params.fromToRanges[0].inputerr = 'input-error';
          }
          if ($scope.vis.params.fromToRanges[0].to > $scope.vis.params.fromToRanges[0].from) {
            $scope.vis.params.fromToRanges[0].inputerr = '';
          }
          // 如果下面的from大于上面的from标红
          if ($scope.vis.params.fromToRanges[i + 1].to <= $scope.vis.params.fromToRanges[i].to) {
            $scope.vis.params.fromToRanges[i + 1].inputerr = 'input-error';
          } else {
            $scope.vis.params.fromToRanges[i + 1].inputerr = '';
          }
        }
      }
      $scope.$parent.$parent.visualizeEditor.softErrorCount = function () {
        return 0;
      };
    }, true);
    //划分阶段数量,显示初始时候的颜色和刻度范围
    $scope.changeRanges = function () {
      // if ($scope.vis.params.maxGauge <= $scope.vis.params.minGauge) {
      //   $scope.vis.params.inputErrMin = 'input-error';
      // }
      switch ($scope.vis.params.range) {
        case '1':
          $scope.vis.params.fromToRanges = [
            {
              'from': $scope.vis.params.minGauge,
              'to': $scope.vis.params.maxGauge,
              'color': '#91c7ae',
              'disabled': true,
              'inputerr': ''
            }
          ];
          $scope.vis.params.axisLine.lineStyle.color = [[1, $scope.vis.params.fromToRanges[0].color]];
          break;
        case '2':
          $scope.vis.params.fromToRanges = [
            {
              'from': $scope.vis.params.minGauge,
              'to': $scope.vis.params.minGauge + rangeFromTo(2, 1),
              'color': '#91c7ae',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(2, 1),
              'to': $scope.vis.params.maxGauge,
              'color': '#c23531',
              'disabled': true,
              'inputerr': ''
            }
          ];
          $scope.vis.params.axisLine.lineStyle.color = [
            [0.5, $scope.vis.params.fromToRanges[0].color],
            [1, $scope.vis.params.fromToRanges[1].color]
          ];
          break;
        case '3':
          $scope.vis.params.fromToRanges = [
            {
              'from': $scope.vis.params.minGauge,
              'to': $scope.vis.params.minGauge + rangeFromTo(3, 1),
              'color': '#91c7ae',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(3, 1),
              'to': $scope.vis.params.minGauge + rangeFromTo(3, 2),
              'color': '#63869e',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(3, 2),
              'to': $scope.vis.params.maxGauge,
              'color': '#c23531',
              'disabled': true,
              'inputerr': ''
            }
          ];
          $scope.vis.params.axisLine.lineStyle.color = [
            [0.2, $scope.vis.params.fromToRanges[0].color],
            [0.8, $scope.vis.params.fromToRanges[1].color],
            [1, $scope.vis.params.fromToRanges[2].color]
          ];
          break;
        case '4':
          $scope.vis.params.fromToRanges = [
            {
              'from': $scope.vis.params.minGauge,
              'to': $scope.vis.params.minGauge + rangeFromTo(4, 1),
              'color': '#91c7ae',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(4, 1),
              'to': $scope.vis.params.minGauge + rangeFromTo(4, 2),
              'color': '#63869e',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(4, 2),
              'to': $scope.vis.params.minGauge + rangeFromTo(4, 3),
              'color': '#ff8040',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(4, 3),
              'to': $scope.vis.params.maxGauge,
              'color': '#c23531',
              'disabled': true,
              'inputerr': ''
            }
          ];
          $scope.vis.params.axisLine.lineStyle.color = [
            [0.25, $scope.vis.params.fromToRanges[0].color],
            [0.5, $scope.vis.params.fromToRanges[1].color],
            [0.75, $scope.vis.params.fromToRanges[2].color],
            [1, $scope.vis.params.fromToRanges[3].color]
          ];
          break;
        case '5':
          $scope.vis.params.fromToRanges = [
            {
              'from': $scope.vis.params.minGauge,
              'to': $scope.vis.params.minGauge + rangeFromTo(5, 1),
              'color': '#91c7ae',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(5, 1),
              'to': $scope.vis.params.minGauge + rangeFromTo(5, 2),
              'color': '#4a9999',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(5, 2),
              'to': $scope.vis.params.minGauge + rangeFromTo(5, 3),
              'color': '#63869e',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(5, 3),
              'to': $scope.vis.params.minGauge + rangeFromTo(5, 4),
              'color': '#ff8040',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(5, 4),
              'to': $scope.vis.params.maxGauge,
              'color': '#c23531',
              'disabled': true,
              'inputerr': ''
            }
          ];
          $scope.vis.params.axisLine.lineStyle.color = [
            [0.2, $scope.vis.params.fromToRanges[0].color],
            [0.4, $scope.vis.params.fromToRanges[1].color],
            [0.6, $scope.vis.params.fromToRanges[2].color],
            [0.8, $scope.vis.params.fromToRanges[3].color],
            [1, $scope.vis.params.fromToRanges[4].color]
          ];
          break;
        case '6':
          $scope.vis.params.fromToRanges = [
            {
              'from': $scope.vis.params.minGauge,
              'to': $scope.vis.params.minGauge + rangeFromTo(6, 1),
              'color': '#91c7ae',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(6, 1),
              'to': $scope.vis.params.minGauge + rangeFromTo(6, 2),
              'color': '#4a9999',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(6, 2),
              'to': $scope.vis.params.minGauge + rangeFromTo(6, 3),
              'color': '#63869e',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(6, 3),
              'to': $scope.vis.params.minGauge + rangeFromTo(6, 4),
              'color': '#ff8040',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(6, 4),
              'to': $scope.vis.params.minGauge + rangeFromTo(6, 5),
              'color': '#af5f5f',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': $scope.vis.params.minGauge + rangeFromTo(6, 5),
              'to': $scope.vis.params.maxGauge,
              'color': '#c23531',
              'disabled': true,
              'inputerr': ''
            }
          ];
          $scope.vis.params.axisLine.lineStyle.color = [
            [0.17, $scope.vis.params.fromToRanges[0].color],
            [0.33, $scope.vis.params.fromToRanges[1].color],
            [0.5, $scope.vis.params.fromToRanges[2].color],
            [0.67, $scope.vis.params.fromToRanges[3].color],
            [0.83, $scope.vis.params.fromToRanges[4].color],
            [1, $scope.vis.params.fromToRanges[5].color]
          ];
          break;
      }
    };
  });

