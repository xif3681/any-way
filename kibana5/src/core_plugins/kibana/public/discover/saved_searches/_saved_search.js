import _ from 'lodash';
import 'ui/notify';
import uiModules from 'ui/modules';


const module = uiModules.get('discover/saved_searches', [
  'kibana/notify',
  'kibana/courier'
]);

module.factory('SavedSearch', function (courier,$translate) {
  //luochunxiang@eisoo.com
  var message;
  var lang = $translate.use();
  if (lang === 'zh-cn') {
    message = '新保存的搜索';
  } else if (lang === 'zh-tw') {
    message = '新保存的搜索';
  } else {
    message = 'New Saved Search';
  }
  _.class(SavedSearch).inherits(courier.SavedObject);
  function SavedSearch(id) {
    courier.SavedObject.call(this, {
      type: SavedSearch.type,
      mapping: SavedSearch.mapping,
      searchSource: SavedSearch.searchSource,

      id: id,
      defaults: {
        title: message,
        description: '',
        columns: [],
        hits: 0,
        sort: [],
        version: 1
      }
    });
  }

  SavedSearch.type = 'search';

  SavedSearch.mapping = {
    title: 'string',
    description: 'string',
    hits: 'integer',
    columns: 'string',
    sort: 'string',
    version: 'integer'
  };

  SavedSearch.searchSource = true;

  return SavedSearch;
});
