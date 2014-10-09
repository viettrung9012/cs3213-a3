//Usage: <ANY ng-toggle="varName">
//Optionally: ng-toggle-default={bool} //by default - true
var app = angular.module('ngToggle', []);
app.directive('ngToggle', ['$parse', function($parse)
{
	return {
		restrict: 'A',
		link: function($scope, $elem, attrs){
			var varName = attrs.ngToggle;
			var model = $parse(varName);
			if(attrs.ngToggleDefault || attrs.ngToggleDefault === undefined)
				model.assign($scope, true);
			else
				model.assign($scope, false);
			var elem  = $elem[0];
			$(elem).click(function()
			{
				model.assign($scope, !$scope.$eval(varName));
				$scope.$apply();
			});
		}
	};
}]);