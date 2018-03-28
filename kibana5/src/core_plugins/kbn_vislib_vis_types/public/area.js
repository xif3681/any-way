import VislibVisTypeVislibVisTypeProvider from 'ui/vislib_vis_type/vislib_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import areaTemplate from 'plugins/kbn_vislib_vis_types/editors/area.html';

export default function HistogramVisType(Private, $translate) {
  const VislibVisType = Private(VislibVisTypeVislibVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  let message;
  let arPositions;
  let lang = $translate.use();
  if (lang === 'zh-cn') {
    message = [
      {
        value: '堆叠',
        enValue: 'stacked'
      },
      {
        value: '重叠',
        enValue: 'overlap'
      },
      {
        value: '百分比',
        enValue: 'percentage'
      },
      {
        value: '摆动',
        enValue: 'wiggle'
      },
      {
        value: '剪影',
        enValue: 'silhouette'
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
  } else if (lang === 'zh-tw') {
    message = [
      {
        value: '堆叠',
        enValue: 'stacked'
      },
      {
        value: '重叠',
        enValue: 'overlap'
      },
      {
        value: '百分比',
        enValue: 'percentage'
      },
      {
        value: '摆动',
        enValue: 'wiggle'
      },
      {
        value: '剪影',
        enValue: 'silhouette'
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
        value: 'stacked',
        enValue: 'stacked'
      },
      {
        value: 'overlap',
        enValue: 'overlap'
      },
      {
        value: 'percentage',
        enValue: 'percentage'
      },
      {
        value: 'wiggle',
        enValue: 'wiggle'
      },
      {
        value: 'silhouette',
        enValue: 'silhouette'
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
  }

  return new VislibVisType({
    name: 'area',
    title: 'Area chart',
    icon: 'fa-area-chart',
    description: 'Great for stacked timelines in which the total of all series is more important ' +
    'than comparing any two or more series. Less useful for assessing the relative change of ' +
    'unrelated data points as changes in a series lower down the stack will have a difficult to gauge ' +
    'effect on the series above it.',
    params: {
      defaults: {
        shareYAxis: true,
        addTooltip: true,
        addLegend: true,
        legendPosition: 'right',
        smoothLines: false,
        scale: 'linear',
        interpolate: 'linear',
        mode: 'stacked',
        times: [],
        addTimeMarker: false,
        defaultYExtents: false,
        setYExtents: false,
        yAxis: {},
        lang: lang
      },
      scales: ['linear', 'log', 'square root'],
      positions: arPositions,
      modes: message,
      editor: areaTemplate
    },
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Y-Axis',
        min: 1,
        aggFilter: ['!std_dev', '!terms', '!monitors'],
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
        aggFilter: ['!geohash_grid', '!start_end_times' ,'!monitor_another'],
      },
      {
        group: 'buckets',
        name: 'group',
        title: 'Split Area',
        min: 0,
        max: 1,
        aggFilter: ['!geohash_grid', '!start_end_times' ,'!monitor_another'],
      },
      {
        group: 'buckets',
        name: 'split',
        title: 'Split Chart',
        min: 0,
        max: 1,
        aggFilter: ['!geohash_grid', '!start_end_times' ,'!monitor_another'],
      }
    ])
  });
};
