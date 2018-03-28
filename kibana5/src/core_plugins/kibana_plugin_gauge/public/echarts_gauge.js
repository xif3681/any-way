define(function (require) {

  // we also need to load the controller and used by the template
  require('plugins/kibana_plugin_gauge/echarts_gauge_controller');
  require('plugins/kibana_plugin_gauge/echarts_gauge.css');
  var $ = require('jquery');
  // register the provider with the visTypes registry
  // require('ui/registry/vis_types').register(EchartsHistogramVisType);
  return function GaugeVisTypeProvider(Private) {
    var TemplateVisType = Private(require('ui/template_vis_type/template_vis_type'));
    var Schemas = Private(require('ui/vis/schemas'));
    return new TemplateVisType({
      name: '仪表盘图',
      title: '仪表盘图',
      icon: 'fa-tachometer',
      description: '仪表盘适用于展现关键指标数据',
      template: require('plugins/kibana_plugin_gauge/echarts_gauge.html'),
      params: {
        defaults: {
          scale: 'original',
          minGauge: '',
          maxGauge: '',
          range: '3',
          ranges: ['1', '2', '3', '4', '5', '6'],
          angle: '270',
          startAngle: '225',
          endAngle: '-45',
          axisLine: {
            lineStyle: {
              color: [[0.33, '#91c7ae'], [0.67, '#63869e'], [1, '#c23531']]
            }
          },
          fromToRanges: [
            {
              'from': '',
              'to': '',
              'color': '#91c7ae',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': '',
              'to': '',
              'color': '#63869e',
              'disabled': false,
              'inputerr': ''
            },
            {
              'from': '',
              'to': '',
              'color': '#c23531',
              'disabled': true,
              'inputerr': ''
            }
          ],
          firstTime: true,
          notFirstTime: false,
          inputErrMin: false,
          inputErrMax: false,
          softErrorCount: true,
        },
        editor: require('plugins/kibana_plugin_gauge/echarts_gauge_editor.html')
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          min: 1,
          max: 1,
          aggFilter: ['count', 'avg', 'sum', 'median', 'min', 'max', 'cardinality'],
          defaults: [
            {type: 'count', schema: 'metric'}
          ]
        }

      ])
    });
  };
});
