import _ from 'lodash';
import html from 'ui/visualize/visualize_legend.html';
import $ from 'jquery';
import d3 from 'd3';
import findByParam from 'ui/utils/find_by_param';
import VislibLibDataProvider from 'ui/vislib/lib/data';
import VislibComponentsColorColorProvider from 'ui/vislib/components/color/color';
import FilterBarFilterBarClickHandlerProvider from 'ui/filter_bar/filter_bar_click_handler';
import uiModules from 'ui/modules';


uiModules.get('kibana')
  .directive('visualizeLegend', function (Private, getAppState) {
    let Data = Private(VislibLibDataProvider);
    let colorPalette = Private(VislibComponentsColorColorProvider);
    let filterBarClickHandler = Private(FilterBarFilterBarClickHandlerProvider);

    return {
      restrict: 'E',
      template: html,
      link: function ($scope, $elem, $rootScope) {
        let $state = getAppState();
        let clickHandler = filterBarClickHandler($state);
        $scope.open = $scope.uiState.get('vis.legendOpen', true);
        $scope.$watch('renderbot.chartData', function (data) {
          if (!data) return;
          $scope.data = data;
          refresh();
        });
        $scope.highlight = function (event) {
          let el = event.currentTarget;
          let handler = $scope.renderbot.vislibVis.handler;
          if (!handler) return;

          //handler.highlight.call(el, handler.el);
          //lcx
          if (handler.highlight) {
            handler.highlight.call(el, handler.el);
          }

        };

        $scope.unhighlight = function (event) {
          let el = event.currentTarget;
          let handler = $scope.renderbot.vislibVis.handler;
          if (!handler) return;
          //handler.unHighlight.call(el, handler.el);

          //lcx
          if (handler.unHighlight) {
            handler.unHighlight.call(el, handler.el);
          }
        };

        $scope.setColor = function (label, color) {
          let colors = $scope.uiState.get('vis.colors') || {};
          colors[label] = color;
          $scope.uiState.set('vis.colors', colors);
          refresh();
        };

        $scope.toggleLegend = function () {
          let bwcAddLegend = $scope.renderbot.vislibVis._attr.addLegend;
          let bwcLegendStateDefault = bwcAddLegend == null ? true : bwcAddLegend;
          $scope.open = !$scope.uiState.get('vis.legendOpen', bwcLegendStateDefault);
          $scope.uiState.set('vis.legendOpen', $scope.open);
        };

        $scope.getToggleLegendClasses = function () {
          switch ($scope.vis.params.legendPosition) {
            case 'top':
              return $scope.open ? 'fa-chevron-circle-up' : 'fa-chevron-circle-down';
              break;
            case 'bottom':
              return $scope.open ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up';
              break;
            case 'left':
              return $scope.open ? 'fa-chevron-circle-left' : 'fa-chevron-circle-right';
              break;
            case 'right':
            default:
              return $scope.open ? 'fa-chevron-circle-right' : 'fa-chevron-circle-left';
          }
        };

        $scope.filter = function (legendData, negate) {
          clickHandler({point: legendData, negate: negate});
        };

        $scope.canFilter = function (legendData) {
          let filters = clickHandler({point: legendData}, true) || [];
          return filters.length;
        };

        $scope.colors = [
          '#3F6833', '#967302', '#2F575E', '#99440A', '#58140C', '#052B51', '#511749', '#3F2B5B', //6
          '#508642', '#CCA300', '#447EBC', '#C15C17', '#890F02', '#0A437C', '#6D1F62', '#584477', //2
          '#629E51', '#E5AC0E', '#64B0C8', '#E0752D', '#BF1B00', '#0A50A1', '#962D82', '#614D93', //4
          '#7EB26D', '#EAB839', '#6ED0E0', '#EF843C', '#E24D42', '#1F78C1', '#BA43A9', '#705DA0', // Normal
          '#9AC48A', '#F2C96D', '#65C5DB', '#F9934E', '#EA6460', '#5195CE', '#D683CE', '#806EB7', //5
          '#B7DBAB', '#F4D598', '#70DBED', '#F9BA8F', '#F29191', '#82B5D8', '#E5A8E2', '#AEA2E0', //3
          '#E0F9D7', '#FCEACA', '#CFFAFF', '#F9E2D2', '#FCE2DE', '#BADFF4', '#F9D9F9', '#DEDAF7'  //7
        ];

        function refresh() {
          let vislibVis = $scope.renderbot.vislibVis;

          if ($scope.uiState.get('vis.legendOpen') == null && vislibVis._attr.addLegend != null) {
            $scope.open = vislibVis._attr.addLegend;
          }

          $scope.labels = getLabels($scope.data, vislibVis._attr.type);
          $scope.getColor = colorPalette(_.pluck($scope.labels, 'label'), $scope.uiState.get('vis.colors'));
        }

        // Most of these functions were moved directly from the old Legend class. Not a fan of this.
        function getLabels(data, type) {
          if (!data) return [];
          data = data.columns || data.rows || [data];
          if (type === 'pie') return Data.prototype.pieNames(data);
          return getSeriesLabels(data);
        };

        function getSeriesLabels(data) {
          let values = data.map(function (chart) {
            return chart.series;
          })
            .reduce(function (a, b) {
              return a.concat(b);
            }, []);
          return _.compact(_.uniq(values, 'label'));
        }

        //针对甘特图
        $scope.openGantt = true;
        $scope.getToggleLegendClassesGantt = 'fa-chevron-circle-right';
        $scope.toggleLegendGantt = function () {
          $scope.openGantt = !$scope.openGantt;
          $scope.getToggleLegendClassesGantt = $scope.openGantt ? 'fa-chevron-circle-right' : 'fa-chevron-circle-left';
        };

        $scope.$watch('vis.params.arCategory', function (value) {
          $scope.labelGantts = value;
        });
        if (!($scope.vis && $scope.vis.params.arCategoryGantt)) {
          return;
        }
        let ganttArray = $scope.vis.params.arCategoryGantt.ganttArray || [];
        $scope.filterGantt = function (legendData, negate) {
          if (negate) {
            filterGanttLegendData(1, legendData);//点的为+
          } else {
            filterGanttLegendData(-1, legendData);//点的为-
          }
          //ganttArray标记对应的index是点击的加（1）还是减（-1）按钮
          function filterGanttLegendData(flag, legendData) {
            let myFlag = true;
            for (let i = 0; i < ganttArray.length; i++) {
              if (ganttArray[i].legendData === legendData) {
                ganttArray[i].num = flag;
                myFlag = false;
              }
            }
            if (myFlag) {
              ganttArray.push({
                legendData: legendData,
                num: flag
              });
            }
          }

          //ganttArrayFilter为计算出点击减的legendData
          let ganttArrayFilter = [];
          ganttArray.map(function (obj) {
            if (obj.num < 0) {
              ganttArrayFilter.push(obj.legendData);
            }
          });
          let arCategoryGantt = [];//当前界面Y轴
          //$scope.labelGantts里面删除ganttArrayFilterue
          for (let i = 0; i < $scope.labelGantts.length; i++) {
            if (ganttArrayFilter.length) {
              for (let j = 0; j < ganttArrayFilter.length; j++) {
                if ($scope.labelGantts[i] === ganttArrayFilter[j]) {
                  break;
                }
                if ($scope.labelGantts[i] !== ganttArrayFilter[j] && j === ganttArrayFilter.length - 1) {
                  arCategoryGantt.push($scope.labelGantts[i]);
                  break;
                }
              }
            } else {
              arCategoryGantt.push($scope.labelGantts[i]);
            }
          }
          $scope.vis.params.arCategoryGantt = {
            value: arCategoryGantt,
            change: true,
            ganttArray: ganttArray
          };
          $scope.$emit('ganttToParent', $scope.vis.params.arCategoryGantt);
        };
      }
    };
  });
