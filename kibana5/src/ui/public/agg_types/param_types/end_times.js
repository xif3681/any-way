import {SavedObjectNotFound} from 'ui/errors';
import _ from 'lodash';
import editorHtml from 'ui/agg_types/controls/end_times.html';
import AggTypesParamTypesBaseProvider from 'ui/agg_types/param_types/base';
export default function StartTimesAggParamFactory(Private,$rootScope) {

  let BaseAggParam = Private(AggTypesParamTypesBaseProvider);

  _.class(EndTimesAggParam).inherits(BaseAggParam);
  function EndTimesAggParam(config) {
    EndTimesAggParam.Super.call(this, config);
  }

  EndTimesAggParam.prototype.editor = editorHtml;
  EndTimesAggParam.prototype.scriptable = false;
  EndTimesAggParam.prototype.filterFieldTypes = '*';

  /**
   * Called to serialize values for saving an aggConfig object
   *
   * @param  {field} field - the field that was selected
   * @return {string}
   */
  EndTimesAggParam.prototype.serialize = function (field) {
    return field.name;
  };

  /**
   * Called to read values from a database record into the
   * aggConfig object
   *
   * @param  {string} fieldName
   * @return {field}
   */
  EndTimesAggParam.prototype.deserialize = function (fieldName, aggConfig) {
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
  EndTimesAggParam.prototype.write = function (agg, output) {
    let endTimes = agg.params.end_times;
    if (!endTimes) {
      return;
    }
    if (endTimes.scripted) {
      output.params.script = {
        inline: endTimes.script,
        lang: endTimes.lang,
      };
    } else {
      output.params.end_times = endTimes.name;
      $rootScope.arGanttEndTime = endTimes.name;
    }
  };

  return EndTimesAggParam;
};
