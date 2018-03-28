module.exports = function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: ['plugins/kibana_plugin_gantt/kibana_plugin_gantt']
    }
  });
};
