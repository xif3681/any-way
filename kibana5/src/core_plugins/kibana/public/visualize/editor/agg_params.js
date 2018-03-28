import IndexedArray from 'ui/indexed_array';
import _ from 'lodash';
import $ from 'jquery';
import aggSelectHtml from 'plugins/kibana/visualize/editor/agg_select.html';
import advancedToggleHtml from 'plugins/kibana/visualize/editor/advanced_toggle.html';
import 'ui/filters/match_any';
import 'plugins/kibana/visualize/editor/agg_param';
import AggTypesIndexProvider from 'ui/agg_types/index';
import uiModules from 'ui/modules';
import aggParamsTemplate from 'plugins/kibana/visualize/editor/agg_params.html';

uiModules
  .get('app/visualize')
  .directive('visEditorAggParams', function ($compile, $parse, Private, Notifier, $filter, aggIndex, $translate) {
    const aggTypes = Private(AggTypesIndexProvider);
    const notify = new Notifier({
      location: 'visAggGroup'
    });
    //翻译
    var lang = $translate.use();
    let intervals;
    if (lang === 'en-us') {
      intervals = [{
        id: 1,
        value: '>',
      }, {
        id: 2,
        value: '=',
      }, {
        id: 3,
        value: '<',
      }, {
        id: 4,
        value: '<',
      }, {
        id: 5,
        value: 'not in',
      }];
    } else if (lang === 'zh-cn') {
      intervals = [{
        id: 1,
        value: '大于',
      }, {
        id: 2,
        value: '等于',
      }, {
        id: 3,
        value: '小于',
      }, {
        id: 4,
        value: '介于',
      }, {
        id: 5,
        value: '非介于',
      }];
    } else {
      intervals = [{
        id: 1,
        value: '大於',
      }, {
        id: 2,
        value: '等於',
      }, {
        id: 3,
        value: '小於',
      }, {
        id: 4,
        value: '介於',
      }, {
        id: 5,
        value: '非介於',
      }];
    }
    return {
      restrict: 'E',
      template: aggParamsTemplate,
      scope: true,
      link: function ($scope, $el, attr) {
        $scope.$bind('agg', attr.agg);
        $scope.$bind('groupName', attr.groupName);

        $scope.aggTypeOptions = aggTypes.byType[$scope.groupName];
        $scope.advancedToggled = false;

        // this will contain the controls for the schema (rows or columns?), which are unrelated to
        // controls for the agg, which is why they are first
        const $schemaEditor = $('<div>').addClass('schemaEditors').appendTo($el);

        if ($scope.agg.schema.editor) {
          $schemaEditor.append($scope.agg.schema.editor);
          $compile($schemaEditor)($scope.$new());
        }

        // allow selection of an aggregation
        const $aggSelect = $(aggSelectHtml).appendTo($el);
        $compile($aggSelect)($scope);

        // params for the selected agg, these are rebuilt every time the agg in $aggSelect changes
        let $aggParamEditors; //  container for agg type param editors
        let $aggParamEditorsScope;
        $scope.$watch('agg.type', function updateAggParamEditor(newType, oldType) {
          if ($aggParamEditors) {
            $aggParamEditors.remove();
            $aggParamEditors = null;
          }

          // if there's an old scope, destroy it
          if ($aggParamEditorsScope) {
            $aggParamEditorsScope.$destroy();
            $aggParamEditorsScope = null;
          }

          // create child scope, used in the editors
          $aggParamEditorsScope = $scope.$new();

          const agg = $scope.agg;
          if (!agg) return;

          const type = $scope.agg.type;

          if (newType !== oldType) {
            // don't reset on initial load, the
            // saved params should persist
            agg.resetParams();
          }

          if (!type) return;

          const aggParamHTML = {
            basic: [],
            advanced: []
          };

          // build collection of agg params html
          type.params.forEach(function (param, i) {
            let aggParam;
            // if field param exists, compute allowed fields
            if (param.name === 'field') {
              $aggParamEditorsScope.indexedFields = getIndexedFields(param);
            } else if (param.name === 'start_times') {
              $aggParamEditorsScope.indexedFieldsStart = getIndexedFields(param);
            } else if (param.name === 'end_times') {
              $aggParamEditorsScope.indexedFieldsEnd = getIndexedFields(param);
            }

            if ($aggParamEditorsScope.indexedFields) {
              const hasIndexedFields = $aggParamEditorsScope.indexedFields.length > 0;
              const isExtraParam = i > 0;
              if (!hasIndexedFields && isExtraParam) { // don't draw the rest of the options if their are no indexed fields.
                return;
              }
            }


            let type = 'basic';
            if (param.advanced) type = 'advanced';

            if (aggParam = getAggParamHTML(param, i)) {
              aggParamHTML[type].push(aggParam);
            }
            /**
             * 状态监控，颜色选择
             */
            const colors = [
              '#da0000', '#e91e63', '#e91ee1', '#ff5722',
              '#ff9800', '#ffc107', '#ffeb3b', '#cddc39'
            ];
            if (param.name === 'color' && aggIndex.add) {
              $scope.agg.params.color = colors[aggIndex.index - 1];
              if (aggIndex.index > 9) {
                $scope.agg.params.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
              }
              aggIndex.add = false;
            }
            /**
             * 状态监控，intervals翻译
             */
            if (param.name === 'intervals') {
              $scope.agg.params.intervals = intervals;
            }
          });

          // compile the paramEditors html elements
          let paramEditors = aggParamHTML.basic;

          if (aggParamHTML.advanced.length) {
            paramEditors.push($(advancedToggleHtml).get(0));
            paramEditors = paramEditors.concat(aggParamHTML.advanced);
          }

          $aggParamEditors = $(paramEditors).appendTo($el);
          $compile($aggParamEditors)($aggParamEditorsScope);
        });

        // build HTML editor given an aggParam and index
        function getAggParamHTML(param, idx) {
          // don't show params without an editor
          if (!param.editor) {
            return;
          }

          const attrs = {
            'agg-param': 'agg.type.params[' + idx + ']'
          };

          if (param.advanced) {
            attrs['ng-show'] = 'advancedToggled';
          }

          return $('<vis-agg-param-editor>')
            .attr(attrs)
            .append(param.editor)
            .get(0);
        }

        function getIndexedFields(param) {
          let fields = _.filter($scope.agg.vis.indexPattern.fields.raw, 'aggregatable');
          const fieldTypes = param.filterFieldTypes;

          if (fieldTypes) {
            fields = $filter('fieldType')(fields, fieldTypes);
            fields = $filter('orderBy')(fields, ['type', 'name']);
          }

          return new IndexedArray({

            /**
             * @type {Array}
             */
            index: ['name'],

            /**
             * [group description]
             * @type {Array}
             */
            initialSet: fields
          });
        }
      }
    };
  });
