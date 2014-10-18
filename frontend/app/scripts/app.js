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
    'ngTouch', 'ngDragDrop', 'ui.tree', 'satellizer'
  ]).config(function($authProvider) {

    $authProvider.google({
      clientId: '353055755298-lvrfqibegsmulqs1hvqk6mdegu9ldegs.apps.googleusercontent.com'
    });

   
});
