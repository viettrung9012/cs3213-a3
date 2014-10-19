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
    'ngTouch', 'ngDragDrop', 'ui.tree', 'ngAnimate', 'directive.g+signin', 'uuid4', 'ui.bootstrap', 'oitozero.ngSweetAlert'
  ]);
