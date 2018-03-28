import 'plugins/tagcloud/tag_cloud.less';
import 'plugins/tagcloud/tag_cloud_controller';
import 'plugins/tagcloud/tag_cloud_vis_params';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import tagCloudTemplate from 'plugins/tagcloud/tag_cloud_controller.html';
import visTypes from 'ui/registry/vis_types';

visTypes.register(function TagCloudProvider(Private, $translate) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  //luochunxiang@eisoo.com
  var scales;
  var orientations;
  var linear;
  var single;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
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
    orientations = [
      {
        value: '单角度',
        enValue: 'single'
      },
      {
        value: '直角',
        enValue: 'right angled'
      },
      {
        value: '多角度',
        enValue: 'multiple'
      }];
  } else if (lang === 'zh-tw') {
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
    orientations = [
      {
        value: '單角度',
        enValue: 'single'
      },
      {
        value: '直角',
        enValue: 'right angled'
      },
      {
        value: '多角度',
        enValue: 'multiple'
      }];
  } else {
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
    orientations = [
      {
        value: 'single',
        enValue: 'single'
      },
      {
        value: 'right angled',
        enValue: 'right angled'
      },
      {
        value: 'multiple',
        enValue: 'multiple'
      }];
  }

  return new TemplateVisType({
    name: 'tagcloud',
    title: 'Tag cloud',
    implementsRenderComplete: true,
    description: 'A tag cloud visualization is a visual representation of text data, ' +
    'typically used to visualize free form text. Tags are usually single words. The font size of word corresponds' +
    'with its importance.',
    icon: 'fa-cloud',
    template: tagCloudTemplate,
    params: {
      defaults: {
        scale: 'linear',
        orientation: 'single',
        minFontSize: 18,
        maxFontSize: 72
      },
      scales: scales,
      orientations: orientations,
      editor: '<tagcloud-vis-params></tagcloud-vis-params>'
    },
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Tag Size',
        min: 1,
        max: 1,
        aggFilter: ['!std_dev', '!percentiles', '!percentile_ranks' ,'!monitors'],
        defaults: [
          {schema: 'metric', type: 'count'}
        ]
      },
      {
        group: 'buckets',
        name: 'segment',
        icon: 'fa fa-cloud',
        title: 'Tags',
        min: 1,
        max: 1,
        aggFilter: ['terms']
      }
    ])
  });
});


