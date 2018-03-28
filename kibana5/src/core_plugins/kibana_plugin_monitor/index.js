export default function (kibana) {

  return new kibana.Plugin({

    uiExports: {
      visTypes: [
        'plugins/kibana_plugin_monitor/state_vis'
      ]
    }

  });

};
