'use strict';

angular.module('frontendApp')
.directive('drag',function() {
  return {
    template: '<div id="drag" ng-style="{ top: model.y, left: model.x}"><div ng-transclude></div></drag>',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      model: '='
    },
    link: function postLink(scope, element, iAttrs, ctrl) {
      element.draggable({
          drag: function() {
            scope.$apply(function read() {
              scope.model.x = element.css('left');
              scope.model.y = element.css('top');
            });
          },

          stop: function() {
            console.log(scope.model.x, scope.model.y);
          }
        });

      var elem = document.getElementById("spriteContainer");
      element.draggable("option", "containment", elem);
    }
  };
})