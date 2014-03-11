app = angular.module('app', []);

app.controller('mCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

	var getRandom = function() {
		return Math.floor(Math.random()*3600) + Math.random().toString(36).substring(7);
	};
	var getType = function(text) {
		text = text + ' ';
		regexp = /(\()/g
		if (regexp.exec(text)) {
			return 'start';
		};
		regexp = /(\))/g; 
		if (regexp.exec(text)) {
			return 'end';
		};
		regexp1 = /(или )/gi; 
		// if (regexp.exec(text)) {
		// 	return 'or';
		// };
		regexp2 = /(or )/gi; 
		if (regexp1.exec(text) || regexp2.exec(text)) {
			return 'or';
		};
		regexp1 = /(и )/gi; 
		// if (regexp.exec(text)) {
		// 	return 'and';
		// };
		regexp2 = /(and )/gi; 
		if (regexp1.exec(text) || regexp2.exec(text)) {
			return 'and';
		};
		regexp1 = /(не )/gi; 
		// if (regexp.exec(text)) {
		// 	return 'not';
		// };
		regexp2 = /(not )/gi; 
		if (regexp1.exec(text) || regexp2.exec(text)) {
			return 'not';
		};
		regexp = /(.+\*)/gi;
		if (regexp.exec(text)) {
			return 'word-multi';
		};
		regexp = /(.+)/gi; 
		if (regexp.exec(text)) {
			return 'word';
		};
	};
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
	};
	$timeout(function() {
		$(angular.element('textarea')).focus();
	});

	$scope.setStyle = function(word) {
		if (word.type == 'start' || word.type == 'end') {
			a = Math.ceil(parseInt(word.id, 10) / 10);
			return {
				'background-color':'hsl(' + a + ', 50%, 60%)'
			};
		};
	};


	var MANYLIST = [];

	$scope.shader = function() {
		$scope.LIST = [];
		$scope.LIST = $scope.STRING.split(' ');
		$scope.SIDERLIST = [];
		$scope.OBJECTEDLIST = [];

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
		// console.log('$scope.LIST ', $scope.LIST);
		// var open_last = null, 
		// 	close_first = null, 
		// 	local_arr = [];

		// for (var i=0;i<$scope.LIST.length; ) {
		// 	if ($scope.LIST[i].type == 'start') {
		// 		open_last = i++;
		// 	}
		// 	else if ((open_last != null) && ($scope.LIST[i].type == 'end')) {
		// 		close_first = i++;
		// 	}
		// 	else if (($scope.LIST[i].type != 'start') && ($scope.LIST[i].type != 'end')) {
		// 		i++;
		// 	}
		// 	if ((open_last != null) && (close_first != null)) {
		// 		for (k=open_last;k<=close_first;k++) {
		// 			local_arr.push($scope.LIST[k]);
		// 		}
		// 		var diff = close_first - open_last + 1;
		// 		$scope.LIST.splice(open_last, diff, local_arr);
		// 		local_arr = [], 
		// 		open_last = null, 
		// 		close_first = null,
		// 		i = 0;
		// 	}
		// }
	}
}]);

app.directive('string', [function () {
	return {
		restrict: 'A',
		scope: {
			spanId: '=spanid',
			spanType: '=spantype'
		},
		link: function (scope, elem, attrs) {
			var scobe = [];
			setTimeout(function() {
				var list = angular.element(document.querySelectorAll("[types]"));
				for (i in list) {
					if (list[i].attributes && (list[i].attributes.types.nodeValue == 'start')) {
						scobe.push(list[i].attributes.data.nodeValue);
					}
					else if (scobe.length > 0 && list[i].attributes && (list[i].attributes.types.nodeValue == 'end')) {
						scobe.splice(scobe.length-1, 1);
					}
				}
				if (scobe.length !=0) {
					unclosed = angular.element('[data=' + scobe[scobe.length-1] + ']')[0];
					while (unclosed) {
						if ((unclosed.attributes.types.nodeValue == 'start') && (unclosed.attributes.data.nodeValue == scobe[scobe.length-1])) {
							$(unclosed).addClass('unclosed-scobe');
						} else {
							$(unclosed).addClass('unclosed-inner');
						}
						unclosed = unclosed.nextElementSibling;
					}
				}
			})

			elem.on('mouseenter', function() {
				if (scope.spanType == 'start' || scope.spanType == 'end') {
					a = angular.element(document.querySelectorAll("[data]"));

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