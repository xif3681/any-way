module.exports = function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: ['plugins/kibana_plugin_gauge/kibana_plugin_gauge']
    }
  });
};
