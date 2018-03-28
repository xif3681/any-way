import VislibVisTypeVislibVisTypeProvider from 'ui/vislib_vis_type/vislib_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import lineTemplate from 'plugins/kbn_vislib_vis_types/editors/line.html';

export default function HistogramVisType(Private, $translate) {
  const VislibVisType = Private(VislibVisTypeVislibVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);


  var message;
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
    message = [
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
    message = [
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
    message = [
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
  }

  return new VislibVisType({
    name: 'line',
    title: 'Line chart',
    icon: 'fa-line-chart',
    description: 'Often the best chart for high density time series. Great for comparing one series to another. ' +
    'Be careful with sparse sets as the connection between points can be misleading.',
    params: {
      defaults: {
        shareYAxis: true,
        addTooltip: true,
        addLegend: true,
        legendPosition: 'right',
        showCircles: true,
        smoothLines: false,
        interpolate: 'linear',
        scale: 'linear',
        drawLinesBetweenPoints: true,
        radiusRatio: 9,
        times: [],
        addTimeMarker: false,
        defaultYExtents: false,
        setYExtents: false,
        yAxis: {}
      },
      positions: arPositions,
      scales: message,
      editor: lineTemplate
    },
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Y-Axis',
        min: 1,
        aggFilter: ['!terms' ,'!monitors'],
        defaults: [
          {schema: 'metric', type: 'count'}
        ]
      },
      {
        group: 'metrics',
        name: 'radius',
        title: 'Dot Size',
        min: 0,
        max: 1,
        aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality']
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
        title: 'Split Lines',
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
