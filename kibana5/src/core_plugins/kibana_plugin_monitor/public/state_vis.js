import 'plugins/kibana_plugin_monitor/state_vis.less';
import 'plugins/kibana_plugin_monitor/state_vis_controller';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import stateVisBucketsTemplate from 'plugins/kibana_plugin_monitor/state_bucket_vis.html';
import stateVisTemplate from 'plugins/kibana_plugin_monitor/state_vis.html';
import stateVisParamsTemplate from 'plugins/kibana_plugin_monitor/state_vis_params.html';
// we need to load the css ourselves

// we also need to load the controller and used by the template

// register the provider with the visTypes registry
require('ui/registry/vis_types').register(MonitorVisProvider);

function MonitorVisProvider(Private, $translate) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);
  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'arMonitor',
    title: '状态监测',
    description: '状态监控可用颜色直观显示风险事件的状态。风险事件和状态阈值均可自定义。',
    icon: 'fa-exclamation-circle',
    template: stateVisTemplate,
    params: {
      defaults: {
        name: '',
        nameAnother: '正常',
        color: '',
        colorAnother: '#008000',
        text: '123456',
        srarchObj: [],
        searchUrl: '',
        fontSize: '150'
      },
      editor: stateVisParamsTemplate
    },
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: '监控状态',
        min: 1,
        aggFilter: ['monitors'],
        defaults: [
          {type: 'monitors', schema: 'metric'}
        ],
      },
      {
        group: 'buckets',
        name: 'bucket',
        title: 'arAnotherState',
        min: 1,
        max: 1,
        aggFilter: ['monitor_another'],
        defaults: [
          {type: 'monitor_another', schema: 'bucket'}
        ],
        editor: stateVisBucketsTemplate
      }
    ])
  });
}

// export the provider so that the visType can be required with Private()
export default MonitorVisProvider;
