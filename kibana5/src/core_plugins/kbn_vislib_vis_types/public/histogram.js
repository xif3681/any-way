import VislibVisTypeVislibVisTypeProvider from 'ui/vislib_vis_type/vislib_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import histogramTemplate from 'plugins/kbn_vislib_vis_types/editors/histogram.html';

export default function HistogramVisType(Private) {
  const VislibVisType = Private(VislibVisTypeVislibVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  //luochunxiang@eisoo.com
  var message;
  var scales;
  let arPositions;
  var lang = window.localStorage.lang;
  if (lang === 'en-us') {
    message = [
      {
        value: 'stacked',
        enValue: 'stacked'
      },
      {
        value: 'percentage',
        enValue: 'percentage'
      },
      {
        value: 'grouped',
        enValue: 'grouped'
      }];
    scales = [
      {
        value: 'linear',
        enValue: 'linear'
      },
      {
        value: 'log',
        enValue: 'log'
      },
      {
        value: 'square root',
        enValue: 'square root'
      }];
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
  } else if (lang === 'zh-tw') {
    message = [
      {
        value: '堆疊模式',
        enValue: 'stacked'
      },
      {
        value: '百分比模式',
        enValue: 'percentage'
      },
      {
        value: '分組模式',
        enValue: 'grouped'
      }];
    scales = [
      {
        value: '線性刻度',
        enValue: 'linear'
      },
      {
        value: '對數刻度',
        enValue: 'log'
      },
      {
        value: '平方根刻度',
        enValue: 'square root'
      }];
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
    message = [
      {
        value: '堆叠模式',
        enValue: 'stacked'
      },
      {
        value: '百分比模式',
        enValue: 'percentage'
      },
      {
        value: '分组模式',
        enValue: 'grouped'
      }];
    scales = [
      {
        value: '线性刻度',
        enValue: 'linear'
      },
      {
        value: '对数刻度',
        enValue: 'log'
      },
      {
        value: '平方根刻度',
        enValue: 'square root'
      }];
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
  }

  return new VislibVisType({
    name: 'histogram',
    title: 'Vertical bar chart',
    icon: 'fa-bar-chart',
    description: 'The goto chart for oh-so-many needs. Great for time and non-time data. Stacked or grouped, ' +
    'exact numbers or percentages. If you are not sure which chart you need, you could do worse than to start here.',
    params: {
      defaults: {
        shareYAxis: true,
        addTooltip: true,
        addLegend: true,
        legendPosition: 'right',
        scale: 'linear',
        mode: 'stacked',
        times: [],
        addTimeMarker: false,
        defaultYExtents: false,
        setYExtents: false,
        yAxis: {}
      },
      positions: arPositions,
      scales: scales,
      modes: message,
      editor: histogramTemplate
    },
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Y-Axis',
        min: 1,
        aggFilter: ['!std_dev', '!terms' ,'!monitors'],
        defaults: [
          {schema: 'metric', type: 'count'}
        ]
      },
      {
        group: 'buckets',
        name: 'segment',
        title: 'X-Axis',
        min: 0,
        max: 1,
        aggFilter: ['!geohash_grid', '!start_end_times' ,'!monitor_another']
      },
      {
        group: 'buckets',
        name: 'group',
        title: 'Split Bars',
        min: 0,
        max: 1,
        aggFilter: ['!geohash_grid', '!start_end_times' ,'!monitor_another']
      },
      {
        group: 'buckets',
        name: 'split',
        title: 'Split Chart',
        min: 0,
        max: 1,
        aggFilter: ['!geohash_grid', '!start_end_times' ,'!monitor_another']
      }
    ])
  });
};
