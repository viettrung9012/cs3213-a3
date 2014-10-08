angular.module('dragAndDrop', [])
  .directive( 'drag', function ( dndApi ) {

    var drags = [];
    var parent = function(drag, max) {
      if(max > 5) {  return false; } /* Just incase */
      var p = drag.parent();
      if(p.hasClass('drop')) {
        return p[0];
      } else {
        max++;
        return parent(p, max);
      }
    };
    var dragables = [];
    var attrs = ['start', 'end', 'dndData'];
    return {
      restrict: 'A',
      link: function ( $scope, $elem, $attr ) {
        dragables.push($elem);
        var me = {};
        angular.forEach(attrs, function(attr, key) {
          if($attr[attr]) { me[attr] = $scope.$eval($attr[attr]); }
        });
        if(angular.isUndefined(me.dndData)) { return; } 

        var elem  = $elem[0];

        elem.addEventListener( 'dragstart', function ( e ) {
          if(drags.length === 0) { drags = document.querySelectorAll( '.drop' ); }

          angular.forEach(dndApi.areas(), function ( value, key ) {
            if(value[0] !== parent($elem, 0)) { value.addClass('dropable'); }
          });

          $elem.addClass('dragging');
	
          dndApi.setData(me.dndData, $elem);

          (e.originalEvent || e).dataTransfer.effectAllowed = 'move';

          (e.originalEvent || e).dataTransfer.setData( 'text', 'test' );

          if(angular.isFunction(me.start)) {
            $scope.$apply(function() {
              me.start(dndApi.getData(), $elem);
            });
          }

        });

        elem.addEventListener( 'dragend', function ( e ) {
          $elem.removeClass('dragging');
          angular.forEach(dndApi.areas(), function(area) {
            area.removeClass('dropable');
          });
          angular.forEach(dragables, function($el) {
            $el.removeClass('hover');
          });
          if(angular.isFunction(me.end)){
            $scope.$apply(function() {
              me.end(dndApi.getData(), $elem);
            });
          }
		  //e.stopPropagation();
          dndApi.clear();
        });

        var hasHover = false;
        elem.addEventListener ( 'dragover', function ( e ) {
          if (e.preventDefault) { e.preventDefault(); }
          if(!hasHover) {
            $elem.addClass('draggable_hover');
            hasHover = true;
          }
          return false;
        });

        elem.addEventListener ( 'dragleave', function ( e ) {
          if (e.preventDefault) { e.preventDefault(); }
          if(hasHover) {
            $elem.removeClass('draggable_hover');
            hasHover = false;
          }
          return false;
        });

        elem.draggable = true;
        $elem.addClass('drag');
      }
    };
  }).directive( 'drop', function ( dndApi ) {

    var areas = [];
    var drags = [];
    var attrs = ['drop', 'enter', 'leave'];

    return {
      link: function ( $scope, $elem, $attr ) {
        
        var me      = {};
        var elem    = $elem[0];
        var left    = elem.offsetLeft,
            right   = left + elem.offsetWidth,
            top     = elem.offsetTop,
            bottom  = top + elem.offsetHeight;

        var dndData = $scope.$eval($attr.dndData);

        angular.forEach(attrs, function(attr, key) {
          if($attr[attr]) { me[attr] = $scope.$eval($attr[attr]); }
        });

        dndApi.addArea($elem);

        elem.addEventListener( 'drop', function ( e ) {
          if (e.preventDefault) { e.preventDefault(); }
		  dndData = $scope.$eval($attr.dndData);

          var result = dndApi.getData();
          if(!$elem.hasClass('dropable')){ return; }
          if(angular.isFunction(me.drop)) {
            $scope.$apply(function() {
                me.drop(result.data, result.element, dndData);
            });
          }

          angular.forEach(dndApi.areas(), function (area, key) {
            area.addClass('dropable');
            area.removeClass('hover');
          });

          $elem.removeClass("hover");
		  e.stopPropagation();
          dndApi.clear();
        });

        var hasHover = false;
        elem.addEventListener ('dragenter', function(e) {
          if(!hasHover) {
            $elem.addClass('hover');
            hasHover = true;
          }
          if(elem === e.target && angular.isFunction(me.enter)) {
            $scope.$apply(function() {
              var result = dndApi.getData();
              me.enter(result.data, result.element);
            });
          }
        });

        elem.addEventListener ( 'dragleave', function(e) {
          if(hasHover) {
            $elem.removeClass('hover');
            hasHover = false;
          }
          if((e.x < left || e.x > right) || (e.y < top  || e.y > bottom)) {
            if(angular.isFunction(me.leave)){
              $scope.$apply(function() {
                var result = dndApi.getData();
                me.leave(result.data, result.element);
              });
            }
          }
        });

        elem.addEventListener ( 'dragover', function ( e ) {
          if(!hasHover) {
            $elem.addClass('hover');
            hasHover = true;
          }
          if (e.preventDefault) { e.preventDefault(); }
          return false;
        });

        $elem.addClass('drop');
      }
    };

  }).factory('dndApi', function() {

    var dnd = {
      dragObject : {}
    };

    var areas = [];

    return {
      addArea : function(area){
        areas.push(area);
      },
      areas : function() {
        return areas;
      },
      setData : function(data, element) {
        dnd.drag = { data : data, element : element};
      },
      clear : function(){
        delete dnd.drag;
      },
      getData : function(){
        return dnd.drag;
      }
    };
  });



