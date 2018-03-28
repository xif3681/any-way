define(function (require) {
  var visTypes = require('ui/registry/vis_types');
  visTypes.register(require('plugins/kibana_plugin_gauge/echarts_gauge'));
});
