import uiModules from 'ui/modules';
import $ from 'jquery';
uiModules.get('kibana')
  .service('aggIndex', function () {
    let aggIndex = {'index': 1,'add':false};
    return aggIndex;
  });
