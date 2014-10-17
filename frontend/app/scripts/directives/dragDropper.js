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
              scope.model.x = element.css('top');
              scope.model.y = element.css('left');
            });
          }
        });

      var elem = document.getElementById("spriteContainer");
      element.draggable("option", "containment", elem);
      scope.model.x = element.css('top');
      scope.model.y = element.css('left');
    }
  };
})