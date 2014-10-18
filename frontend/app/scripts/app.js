'use strict';

/**
 * @ngdoc overview
 * @name frontendApp
 * @description
 * # frontendApp
 *
 * Main module of the application.
 */
angular
  .module('frontendApp', [
    'ngTouch', 'ngDragDrop', 'ui.tree', 'directive.g+signin', 'uuid4', 'ui.bootstrap', 'oitozero.ngSweetAlert'
  ]);
