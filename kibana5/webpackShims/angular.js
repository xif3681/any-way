require('jquery');
require('node_modules/angular/angular');
/*
luochunxiang@eisoo.com  & 2016.11.30
 */
require('node_modules/angular-translate/dist/angular-translate.min');
require('node_modules/bower-angular-cookies/angular-cookies');
require('node_modules/angular-translate/dist/angular-translate-loader-partial/angular-translate-loader-partial.min');
require('node_modules/angular-sortable-view/src/angular-sortable-view');
require('node_modules/angular-tree-control/angular-tree-control');
require('node_modules/angular-ui-tree/dist/angular-ui-tree');
module.exports = window.angular;

require('node_modules/angular-elastic/elastic');

//require('ui/modules').get('kibana', ['monospaced.elastic']);
require('ui/modules').get('kibana', ['monospaced.elastic', 'pascalprecht.translate','angular-sortable-view','ngCookies','treeControl','ui.tree']);//导入模块
