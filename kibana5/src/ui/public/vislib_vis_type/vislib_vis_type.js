import _ from 'lodash';
import 'ui/vislib';
import 'plugins/kbn_vislib_vis_types/controls/vislib_basic_options';
import 'plugins/kbn_vislib_vis_types/controls/point_series_options';
import 'plugins/kbn_vislib_vis_types/controls/line_interpolation_option';
import VisSchemasProvider from 'ui/vis/schemas';
import VisVisTypeProvider from 'ui/vis/vis_type';
import AggResponsePointSeriesPointSeriesProvider from 'ui/agg_response/point_series/point_series';
import VislibVisTypeVislibRenderbotProvider from 'ui/vislib_vis_type/vislib_renderbot';
export default function VislibVisTypeFactory(Private) {

  let VisTypeSchemas = Private(VisSchemasProvider);
  let VisType = Private(VisVisTypeProvider);
  let pointSeries = Private(AggResponsePointSeriesPointSeriesProvider);
  let VislibRenderbot = Private(VislibVisTypeVislibRenderbotProvider);


  _.class(VislibVisType).inherits(VisType);
  function VislibVisType(opts) {
    opts = opts || {};

    VislibVisType.Super.call(this, opts);

    if (this.responseConverter == null) {
      //默认情况下，kibana把聚合结果转换为点线图数组
      this.responseConverter = pointSeries;
    }

    this.listeners = opts.listeners || {};
  }

  VislibVisType.prototype.createRenderbot = function (vis, $el, uiState) {
    //扩展了createRenderbot方法用来生成VislibRenderbot对象
    return new VislibRenderbot(vis, $el, uiState);
  };

  return VislibVisType;
};
