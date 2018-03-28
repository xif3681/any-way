import {SavedObjectNotFound} from 'ui/errors';
import _ from 'lodash';
import editorHtml from 'ui/agg_types/controls/start_times.html';
import AggTypesParamTypesBaseProvider from 'ui/agg_types/param_types/base';
export default function StartTimesAggParamFactory(Private,$rootScope) {

  let BaseAggParam = Private(AggTypesParamTypesBaseProvider);

  _.class(StartTimesAggParam).inherits(BaseAggParam);
  function StartTimesAggParam(config) {
    StartTimesAggParam.Super.call(this, config);
  }

  StartTimesAggParam.prototype.editor = editorHtml;
  StartTimesAggParam.prototype.scriptable = false;
  StartTimesAggParam.prototype.filterFieldTypes = '*';

  /**
   * Called to serialize values for saving an aggConfig object
   *
   * @param  {field} field - the field that was selected
   * @return {string}
   */
  StartTimesAggParam.prototype.serialize = function (field) {
    return field.name;
  };

  /**
   * Called to read values from a database record into the
   * aggConfig object
   *
   * @param  {string} fieldName
   * @return {field}
   */
  StartTimesAggParam.prototype.deserialize = function (fieldName, aggConfig) {
    let field = aggConfig.vis.indexPattern.fields.byName[fieldName];

    if (!field) {
      throw new SavedObjectNotFound('index-pattern-field', fieldName);
    }

    return field;
  };

  /**
   * Write the aggregation parameter.
   *
   * @param  {Agg} 不要写为aggConfig
   * @param  {object} output - the result of calling write on all of the aggregations
   *                         parameters.
   * @param  {object} output.params - the final object that will be included as the params
   *                               for the agg
   * @return {undefined}
   */
  StartTimesAggParam.prototype.write = function (agg, output) {
    let startTimes = agg.params.start_times;
    if (!startTimes) {
      return;
    }
    if (startTimes.scripted) {
      output.params.script = {
        inline: startTimes.script,
        lang: startTimes.lang,
      };
    } else {
      output.params.start_times = startTimes.name;
      $rootScope.arGanttStartTime = startTimes.name;
    }
  };

  return StartTimesAggParam;
};
