import VislibVisTypeVislibVisTypeProvider from 'ui/vislib_vis_type/vislib_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import pieTemplate from 'plugins/kbn_vislib_vis_types/editors/pie.html';

export default function HistogramVisType(Private,$translate) {
  const VislibVisType = Private(VislibVisTypeVislibVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);


  let arPositions;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    arPositions = [
      {
        value: '顶部',
        enValue: 'top'
      },
      {
        value: '左边',
        enValue: 'left'
      },
      {
        value: '右边',
        enValue: 'right'
      },
      {
        value: '底部',
        enValue: 'bottom'
      }];
  } else if (lang === 'zh-tw') {
    arPositions = [
      {
        value: '顶部',
        enValue: 'top'
      },
      {
        value: '左边',
        enValue: 'left'
      },
      {
        value: '右边',
        enValue: 'right'
      },
      {
        value: '底部',
        enValue: 'bottom'
      }];
  } else {
    arPositions = [
      {
        value: 'top',
        enValue: 'top'
      },
      {
        value: 'left',
        enValue: 'left'
      },
      {
        value: 'right',
        enValue: 'right'
      },
      {
        value: 'bottom',
        enValue: 'bottom'
      }];
  }

  return new VislibVisType({
    name: 'pie',
    title: 'Pie chart',
    icon: 'fa-pie-chart',
    description: 'Pie charts are ideal for displaying the parts of some whole. For example, sales percentages by department.' +
     'Pro Tip: Pie charts are best used sparingly, and with no more than 7 slices per pie.',
    params: {
      defaults: {
        shareYAxis: true,
        addTooltip: true,
        addLegend: true,
        legendPosition: 'right',
        isDonut: false
      },
      positions: arPositions,
      editor: pieTemplate
    },
    responseConverter: false,
    hierarchicalData: true,
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Slice Size',
        min: 1,
        max: 1,
        aggFilter: ['sum', 'count', 'cardinality'],
        defaults: [
          { schema: 'metric', type: 'count' }
        ]
      },
      {
        group: 'buckets',
        name: 'segment',
        icon: 'fa fa-scissors',
        title: 'Split Slices',
        min: 0,
        max: Infinity,
        aggFilter: ['!geohash_grid','!start_end_times' ,'!monitor_another']
      },
      {
        group: 'buckets',
        name: 'split',
        icon: 'fa fa-th',
        title: 'Split Chart',
        mustBeFirst: true,
        min: 0,
        max: 1,
        aggFilter: ['!geohash_grid','!start_end_times' ,'!monitor_another']
      }
    ])
  });
};
