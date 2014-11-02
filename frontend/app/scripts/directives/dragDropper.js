'use strict';

angular.module('frontendApp')
.directive('drag', ['$animate', function($animate) {
  return {
    template: '<div ng-style="{ top: model.y, left: model.x}"><div ng-transclude></div></drag>',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      disable: '=',
      model: '='
    },
    link: function postLink(scope, element, iAttrs, ctrl) {
      element.draggable({
          drag: function() {
            scope.$apply(function read() {
              scope.model.x = element.css('left');
              scope.model.y = element.css('top');
            });
          }
      });
      var elem = document.getElementById("spriteContainer");
      element.draggable("option", "containment", elem);
      scope.$watch(
        function(){return scope.disable;}, 
        function(){
          if(scope.disable) {
            element.draggable("disable");
			element.addClass('swift-transition');
			$compile(element)(scope);
          } else {
            element.draggable("enable");
			element.removeClass('swift-transition');
			$compile(element)(scope);
          }
        }, true
      );

      scope.$watch(
          function(){return scope.model.moving;}, 
          function(){
            console.log("Value changed");
          },
          true
      );
    }
  };
}])