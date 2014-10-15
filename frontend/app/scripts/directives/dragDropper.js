'use strict';

angular.module('frontendApp')
.directive('box',function() {
  return {
    template: '<div id="box" ng-style="{ top: model.y, left: model.x}"><div ng-transclude></div></box>',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      model: '='
    },
    link: function postLink(scope, element, iAttrs, ctrl) {
      element.draggable({
          start: function() {
            console.log('start');
          },
          drag: function() {
            console.log('drag');
            scope.$apply(function read() {
              scope.model.x = element.css('top');
              scope.model.y = element.css('left');
            });
          },
          stop: function() {
            console.log('stop');
          }
        });

      var elem = document.getElementById("spriteContainer");
      element.draggable("option", "containment", elem);
    }
  };
})