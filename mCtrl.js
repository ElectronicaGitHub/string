app = angular.module('app', []);

app.controller('mCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

	var getRandom = function() {
		return Math.floor(Math.random()*3600) + Math.random().toString(36).substring(7);
	}
	var getType = function(text) {
		text = text + ' ';
		regexp = /(\()/g
		if (regexp.exec(text)) {
			return 'start';
		}
		regexp = /(\))/g; 
		if (regexp.exec(text)) {
			return 'end';
		}
		regexp = /(или )/gi; 
		if (regexp.exec(text)) {
			return 'or';
		}
		regexp = /(и )/gi; 
		if (regexp.exec(text)) {
			return 'and';
		}
		regexp = /(не )/gi; 
		if (regexp.exec(text)) {
			return 'not';
		}
		regexp = /(.+\*)/gi;
		if (regexp.exec(text)) {
			return 'word-multi';
		}
		regexp = /(.+)/gi; 
		if (regexp.exec(text)) {
			return 'word';
		}
	}
	$scope.setWord = function(word) {
		if (word.type == 'word-multi') {
			res = word.word.substring(0, word.word.length - 1);
			return res;
		} else if (word.type == 'start') {
			return word.word;
		} else if (word.type == 'and') {
			return 'AND';
		} else if (word.type == 'or') {
			return 'OR';
		} else if (word.type == 'not') {
			return 'NOT';
		} else return word.word;
	}
	$timeout(function() {
		$(angular.element('input')).focus();
	});

	$scope.setStyle = function(word) {
		if (word.type == 'start' || word.type == 'end') {
			a = Math.ceil(parseInt(word.id, 10) / 10);
			return {
				'background-color':'hsl(' + a + ', 50%, 60%)'
			}
		}
	}


	var MANYLIST = [];

	$scope.shader = function() {
		$scope.LIST = [];
		$scope.LIST = $scope.STRING.split(' ');
		$scope.SIDERLIST = [];
		$scope.SCOPES = [];

		for (i in $scope.LIST) {
			var localElem = $scope.LIST[i];
			$scope.LIST[i] = {
				'word' : localElem,
				'id' : getRandom(),
				'type' : getType(localElem)
			};
		}
		for (i in $scope.LIST) {
			if ($scope.LIST[i].type == 'start') {
				var last_startFlag = $scope.LIST[i].id;
				if ($scope.SIDERLIST.length > 0) {
					for (s in $scope.SIDERLIST) {
						if (last_startFlag != $scope.SIDERLIST[s]) {
							flag = true;
						}
					}
					if (flag) {
						$scope.SIDERLIST.push(last_startFlag);
					}
				} else {
					$scope.SIDERLIST.push(last_startFlag);
				}
			}

			if ($scope.LIST[i].type == 'end' && last_startFlag) {
				$scope.LIST[i].id = last_startFlag;
				// debugger;
				$scope.SIDERLIST.splice($scope.SIDERLIST.length-1, 1);
				if ($scope.SIDERLIST.length>0) {
					last_startFlag = $scope.SIDERLIST[$scope.SIDERLIST.length-1];
				} else {
					last_startFlag = null;
				}
			}
		}
	}

	$scope.light = function(type, event) {
		data = '';
		if (type == 'start' || type == 'end') {
			data = event.currentTarget.attributes.data.nodeValue;
			elem = angular.element('span').attr('data', data);
			console.log(elem);
		}
	}
}]);

app.directive('string', [function () {
	return {
		restrict: 'A',
		scope: {
			spanId: '=spanid',
			spanType: '=spantype'
		},
		controller : function($scope) {
			$scope.stack = [];
		},
		link: function (scope, elem, attrs) {
			elem.on('mouseenter', function() {
				if (scope.spanType == 'start' || scope.spanType == 'end') {
					a = angular.element(document.querySelectorAll("[data]"));
					console.log('scope.spanId = ', scope.spanId);

					var splicer = function(a) {
						var Closure = false;
						var idsToDelete = [];
						for (i in a) {
							if (!Closure && a[i].attributes && (a[i].attributes.data.nodeValue != scope.spanId)) {
								idsToDelete.push(i);
								Closure = false;
							} 
							else if (!Closure && a[i].attributes && (a[i].attributes.data.nodeValue == scope.spanId)) {
								Closure = true;
							}
							else if (Closure && a[i].attributes && (a[i].attributes.data.nodeValue == scope.spanId)) {
								Closure = false;
							}
							else if (Closure && a[i].attributes && (a[i].attributes.data.nodeValue != scope.spanId)) {
								Closure = true;
							}
						}
						// debugger;
						console.log('ФИНАЛЬНОЕ = ', a);
						for (i = idsToDelete.length -1; i >= 0; i-- ) {
							a.splice(idsToDelete[i],1);
						}
						return a;
					}
					for (elem in splicer(a)) {
						if (a[elem].attributes && (a[elem].attributes.data.nodeValue == scope.spanId)) {
							$(a[elem]).addClass('hero');
						}
						if (a[elem].attributes && (a[elem].attributes.data.nodeValue != scope.spanId)) {
							$(a[elem]).addClass('mini-hero');
						}
					}
				}
			});
			elem.on('mouseleave', function() {
				$(angular.element('.hero')).removeClass('hero');
				$(angular.element('.mini-hero')).removeClass('mini-hero');
			})
		}
	};
}])