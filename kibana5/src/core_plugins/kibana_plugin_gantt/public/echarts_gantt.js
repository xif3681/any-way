define(function (require) {

  // we also need to load the controller and used by the template
  require('plugins/kibana_plugin_gantt/echarts_gantt_controller');
  require('plugins/kibana_plugin_gantt/echarts_gantt.css');
  var $ = require('jquery');
  // register the provider with the visTypes registry
  // require('ui/registry/vis_types').register(EchartsHistogramVisType);
  return function EchartsGanttVisType(Private) {
    var TemplateVisType = Private(require('ui/template_vis_type/template_vis_type'));
    const VislibVisType = Private(require('ui/vislib_vis_type/vislib_vis_type'));
    var Schemas = Private(require('ui/vis/schemas'));
    //return new VislibVisType({
    return new TemplateVisType({
      name: 'gantt',
      title: 'gantt',
      icon: 'fa-tasks',
      description: '甘特图可以形象展示活动列表和时间刻度，并表示出特定项目的活动顺序与持续时间。',
      template: require('plugins/kibana_plugin_gantt/echarts_gantt.html'),
      params: {
        defaults: {
          graph: 'stack',
          shareYAxis: true,
          addTooltip: true,
          addLegend: true,
          legendPosition: 'right',
          arCategory: [],
          arCategorySortByTime: [],
          arCategorySortByTimeFlag: false,
          arCategoryGantt: {
            value: [],
            change: false
          },
          arFirstGanttFlag: true,
        },
        editor: require('plugins/kibana_plugin_gantt/echarts_gantt_editor.html')
      },

      responseConverter: false,
      hierarchicalData: true,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Y-Axis',
          min: 1,
          max: 1,
          aggFilter: ['terms'],
          defaults: [
            {type: 'terms', schema: 'metric'}
          ]
        },
        {
          group: 'buckets',
          name: 'bucket',
          title: 'X-Axis',
          min: 1,
          max: 1,
          aggFilter: ['start_end_times'],
          defaults: [
            {type: 'start_end_times', schema: 'bucket'}
          ]
        }
      ])
    })
      ;
  };
});
