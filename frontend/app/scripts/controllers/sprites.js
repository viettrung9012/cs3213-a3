'use strict';

angular.module('frontendApp')
  .controller('SpritesCtrl', function ($scope, $timeout, SpriteService, SweetAlert, FunctionService) {
 	$scope.sounds = SpriteService.getSoundList();
 	$scope.delay = 500;
 	$scope.timers = [];
 	$scope.varList = [];
 	$scope.varValue = [];
 	$scope.operators = ["+","-","*","/","|", "%", "&", "=", ">", "<", "!"];
 	$scope.validOperators = ["+", "-", "*", "/", "%", "||", "&&", "==", ">", ">=", "<", "<=", "!=", "!"];
 	$scope.stopPlay = false;
 	$scope.totalPlay = 0;
 	$scope.list = SpriteService.getSpriteList();
 	$scope.background = SpriteService.getBackgroundList()[SpriteService.getBackground()].image;
 	$scope.$watch(
 		function() {return SpriteService.getBackground();},
 		function() {
 			$scope.background = SpriteService.getBackgroundList()[SpriteService.getBackground()].image;
 		}
 	);

 	$scope.$watch(
 		function() {return $scope.totalPlay;},
 		function() {
 			if($scope.totalPlay >= $scope.list.length) {
 				$scope.play = false;
 				$scope.totalPlay = 0;
 			}
 		}
 	);

 	$scope.background = null;
 	$scope.index = -1;
 	$scope.steps = 10;
 	$scope.play = false;

 	$scope.$on('spriteListUpdate', function(){
 		FunctionService.updateTabs($scope.list);
 		$scope.list=SpriteService.getSpriteList();
		//console.log(JSON.stringify($scope.list));
 	});

 	$scope.remove = function(index) {
 		$scope.list.splice(index, 1);
 		FunctionService.updateTabs($scope.list);
 	};

 	$scope.$on('runCommands', function(){
 		$scope.play = true;
 		$scope.runCommands();
 	});

 	$scope.$on('stopCommands', function(){
 		$scope.stop();
 	});
	
 	$scope.$on('updateDisplayFunction', function(){
 		$scope.list = FunctionService.getDisplayFunctionList();
 	});
	

 	var CommandStream = function(SpriteObject) {
 		this.functionIndex = 0;
 		this.functionList = JSON.parse(JSON.stringify(SpriteObject.data));
 	};

 	var getNext = function(com, ind){
		if(com.functionIndex >= com.functionList.length) {
			return null;
		}

		var next;
		do {
			next = getNextCommand(com.functionList, com.functionIndex, true, com, ind);
		} while (next != null && next.name == "stop");
		return next;
 	};
 	
 	var getNextCommand = function(list, index, base, com, objIndex) {
 		if(index >= list.length) return null;
 		var current = list[index];
 		if(current.value === -1) current.value = current.initialValue;
 		var next;

 		if(current.name.indexOf("repeat") > -1) {
 			if(current.degrees === 0) {current.nodes.push({name:"stop", delay:10}); current.degrees = 1;}
 			//if at the end of commands in current iteration of repeat
 			//go to next iteration
 			if(current.index >= current.nodes.length) {
 				current.index = 0;
 				current.value--;
 			}

 			//if not yet finished all repeats
 			if(current.value > 0) {
 				console.log(current.nodes);
 				console.log("INDEX:", current.index);
 				next = getNextCommand(current.nodes, current.index, false, com, objIndex);
 				//if the next command in the repeat is a nested repeat
 				if(current.nodes[current.index].name.indexOf("repeat") != -1) {
					//skip to next command if repeat is completed
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				} 
				else if(current.nodes[current.index].name == "while") {
					if(!((current.nodes[current.index].index < 0 && current.nodes[current.index].index < current.nodes[current.index].nodes.length) ||
						($scope.evaluate(current.nodes[current.index].expression, objIndex, false))))
					{
						current.index++;
					} 
				} 
				//next command is an "IF"
				else if(current.nodes[current.index].name.indexOf("if") != -1) {
					var temp, ifNode;
					ifNode = current.nodes[current.index];
					if (ifNode.name == "if") {
						temp = $scope.evaluate(ifNode.expression, objIndex, false);
					} else {
						temp = $scope.checkCollision(objIndex);
					}

					//if(!((current.nodes[current.index].index < 0 && current.nodes[current.index].index < current.nodes[current.index].nodes.length) || temp))
					if((ifNode.index < 0) || (ifNode.index === 0 && temp))
					{	
						console.log("Skipped IF");
						current.nodes[current.index].index = 0;
						current.index++;
					}	
				}
				// do next command
				else {
					console.log("NOT CONTROL :" + next.name);
					current.index++;
				}
 			} 
 			// else, completed all repeat iterations in current nest level
 			else {
 				index++;
 				if(base) {com.functionIndex = index;}
 				next = {name:"stop"};
 				current.value = -1;
 			}
 		} else if (current.name.indexOf("if") != -1) {
 			if(current.degrees === 0) {current.nodes.push({name:"stop", delay:10});current.degrees = 1;}
			var bar;
			if(current.name == "if collision") bar = $scope.checkCollision(objIndex); 
			else bar = $scope.evaluate(current.expression, objIndex, false);
			if(current.index === -1) {current.index = 0;}
			//if expression evaluates to true, and not all commands in "IF" is completed
			if((current.index === 0 && bar) ||(current.index > 0 && current.index < current.nodes.length)) {
				next = getNextCommand(current.nodes, current.index, false, com, objIndex);
				//if the next command in the repeat is a nested repeat
				if(current.nodes[current.index].name.indexOf("repeat") > -1) {
					//skip to next command if repeat is completed
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				} 
				else if(current.nodes[current.index].name == "while") {
					if(!((current.nodes[current.index].index < 0 && current.nodes[current.index].index < current.nodes[current.index].nodes.length) ||
						($scope.evaluate(current.nodes[current.index].expression, objIndex, false))))
					{
						current.index++;
					} 
				} 
				//next command is an "IF"
				else if(current.nodes[current.index].name.indexOf("if") != -1) {
					var temp, ifNode;
					ifNode = current.nodes[current.index];
					if (ifNode.name == "if") {
						temp = $scope.evaluate(ifNode.expression, objIndex, false);
					} else {
						temp = $scope.checkCollision(objIndex);
					}

					//if(!((current.nodes[current.index].index < 0 && current.nodes[current.index].index < current.nodes[current.index].nodes.length) || temp))
					if((ifNode.index < 0) || (ifNode.index === 0 && temp))
					{	
						current.nodes[current.index].index = 0;
						current.index++;
					}	
				}
				else {
					current.index++;
				}
			} else {
				current.index = -1;
				index++;
				if(base) {
					com.functionIndex = index;
				}
				next = {name:"stop"};
			}
 		} else if(current.name === "while") {
 			if(current.degrees === 0) {current.nodes.push({name:"stop", delay:10}); current.degrees = 1;}
 			 //already in the middle of evaluating
 			if(current.index > 0 && current.index < current.nodes.length) {
 			 	next = getNextCommand(current.nodes, current.index, false, com, objIndex);
				//if the next command is a nested repeat
 				if(current.nodes[current.index].name.indexOf("repeat") != -1) {
					//skip to next command if repeat is completed
					if(current.nodes[current.index].value <= 0) {
						current.index++;
					}
				} 
				else if(current.nodes[current.index].name == "while") {
					if(!((current.nodes[current.index].index < 0 && current.nodes[current.index].index < current.nodes[current.index].nodes.length) ||
						($scope.evaluate(current.nodes[current.index].expression, objIndex, false))))
					{
						current.index++;
					} 
				} 
				else if(current.nodes[current.index].name.indexOf("if") != -1) {
					var temp, ifNode;
					ifNode = current.nodes[current.index];
					if (ifNode.name == "if") {
						temp = $scope.evaluate(ifNode.expression, objIndex, false);
					} else {
						temp = $scope.checkCollision(objIndex);
					}

					//if(!((current.nodes[current.index].index < 0 && current.nodes[current.index].index < current.nodes[current.index].nodes.length) || temp))
					if((ifNode.index < 0) || (ifNode.index === 0 && temp))
					{	
						current.nodes[current.index].index = 0;
						current.index++;
					}	
				}
				// do next command
				else {
					current.index++;
				}
 			} else {
 			 	current.index = 0;
 			 	var expression = $scope.evaluate(current.expression, objIndex, false);
 			 	if(expression) {
 			 		next = getNextCommand(current.nodes, current.index, false, com, objIndex);
 			 		current.index++;
 			 	} else {
 			 		index++;
 			 		if(base) {
 			 			com.functionIndex = index;
 			 		}
 			 		next = getNextCommand(list, index, base, com , objIndex);
 			 	}
 			 }
 		} else {
			next = current;
			if(base) {
				com.functionIndex++;
			}
		}

		return next;
 	}

	$scope.evaluate = function(expression, index, checkSyntax) {
		var lexemes = new ExpressionLexer(expression);
		var token = lexemes.getNextToken();
		//var previousToken == null;
		var exp = "";
		while(token !== "EOL") {
			if(token === "ERROR") {
				exp = "ERROR";
				break;
			}else if(!isNaN(token) || token == "(" || token == ")") {
				exp = exp + " " + token;
			}else if ($scope.validOperators.indexOf(token) != -1) {
				exp = exp + token;
			} else if (token === "posX" || token === "positionX") {
				exp = exp + " " + parseInt($scope.list[index].x).toString();
			} else if (token === "posY" || token === "positionY") {
				exp = exp + " " + parseInt($scope.list[index].y).toString();
			} else if (token === "true" || token === "false") {
				exp = exp + " " + token;
			} else {
				if($scope.varList.indexOf(token) != -1) {
					exp = exp + " " + $scope.varValue[$scope.varList.indexOf(token)];
				} else {
					if (checkSyntax == false) {
						$scope.varList.push(token);
						$scope.varValue.push(0);
					}
					exp = exp + " " + " 0";
				}
			}
			//previousToken == token;
			token = lexemes.getNextToken();
		}
		//console.log("EXP:" + exp);
		if(exp === "ERROR" && checkSyntax === true) {
			var error = "Syntax Error in expression \"" + expression + "\" of " + $scope.list[index].name;
			return [true, error];
		}
		try {
			//console.log(eval(exp));
			return eval(exp);
		} catch (e) {
			var error = "Syntax Error in expression \"" + expression + "\" of " + $scope.list[index].name;
			return [true, error];
		}
 	}

 	$scope.checkCollision = function(index) {
 		console.log("Checking for collision of object ", index);
 		console.log($scope.list[index]);
 		console.log("/");
 		for(var i = 0; i < $scope.list.length; i++) {
 			if(i == index) continue;
 			console.log($scope.list[i]);
 			var x = Math.abs(parseInt($scope.list[i].x) - parseInt($scope.list[index].x));
 			var y = Math.abs(parseInt($scope.list[i].y) - parseInt($scope.list[index].y));
 			if(x <= 100 && y <= 100) {
 				return true;
 			}
 		}
 		console.log("/");
 		return false;
 	} 

 	$scope.stop = function() {
 		$scope.stopPlay = true;
 		$scope.totalPlay = $scope.list.length;
 		while($scope.timers.length > 0) {
 			$timeout.cancel($scope.timers.pop());
 		}
 	}
 	

 	$scope.runCommands = function() {
 		var temp;
 		for(var i = 0; i < $scope.list.length; i++) {
 			temp = checkSyntax($scope.list[i].data, i);
 			if(temp[0] === true) break;
 		}
 		if(temp[0] === false) {
	 		$scope.totalPlay = 0;
	 		$scope.stopPlay = false;
	 		for(var i = 0; i < $scope.list.length; i++) {
	 			$scope.executeFunctions(i);
	 		}
 		} else {
 			$scope.stop();
 			//alert(temp[1]);
 			SweetAlert.swal("Oops!", temp[1], "error");
 		}
 	}

 	var checkSyntax = function(list, index) {
 		for(var i = 0; i < list.length; i++) {
 			if(!(list[i].name == "show" || list[i].name == "hide" || list[i].name == "repeat forever" || list[i].name == "if collision")) {
	 			if (list[i].nodes.length > 0) {
	 				var temp = checkSyntax(list[i].nodes, index);
	 				if (temp[0] == true) {
	 					return temp;
	 				}
	 			}
	 			if(list[i].name.indexOf("if") != -1 || list[i].name == "while" || list[i].name == "=") {
	 				var foo = $scope.evaluate(list[i].expression, index, true);
	 				if(foo.constructor === Array) {
	 					return foo;
	 				}
	 			}
	 			if(list[i].name == "=") {
	 				var lexer = new ExpressionLexer(list[i].expression2);
	 				var arr = [];
	 				var token = lexer.getNextToken();
	 				while(token != "EOL") {
	 					arr.push(token);
	 					token = lexer.getNextToken();
	 				}
	 				if (arr.length != 1 || arr[0] == "ERROR" || !isNaN(arr[0]) || $scope.validOperators.indexOf(arr[0]) != -1) {
	 					var exception = "Invalid assignment at object " + $scope.list[index].name;
	 					return [true, exception];
	 				}
	 			}
	 			if(list[i].initialValue != 0) {
	 				var bar = $scope.evaluate(list[i].initialValue, index, true);
	 				if(bar.constructor === Array) {
	 					return bar;
	 				}
	 			}
	 			if(list[i].degrees != 0) {
	 				var yoo = $scope.evaluate(list[i].initialValue, index, true);
	 				if(yoo.constructor === Array) {
	 					return yoo; 
	 				}
	 			}
 			}

 		}

 		return [false];
 	}

	$scope.executeFunctions = function(spriteIndex) {
		var sprite = $scope.list[spriteIndex];
		var functionQueue = new CommandStream(sprite);
		var doActions = function(delay) {
			$scope.timers.push($timeout(function(){
				var data = getNext(functionQueue, spriteIndex);
				if(data != null && $scope.stopPlay == false) {
					runDataCommands(spriteIndex, data);
					SpriteService.updateVariables($scope.varList, $scope.varValue);
					doActions(data.delay);
				} else {
					$scope.totalPlay++;
				}
			}, delay));
		};

		doActions($scope.delay);
	}

 	var runDataCommands = function(index, data) {
 		if (data.name == "setX") {
 			commandSetX(index, $scope.evaluate(data.value));
 		} else if (data.name == "setY") {
 			commandSetY(index, $scope.evaluate(data.value));
 		} else if (data.name == "show") {
 			commandShow(index);
 		} else if (data.name == "hide") {
 			commandHide(index);
 		} else if (data.name == "move") {
 			commandMove(index, $scope.evaluate(data.value), $scope.evaluate(data.degrees));
 		} else if (data.name == "set costume") {
 			commandChangeCostume(index, $scope.evaluate(data.value));
 		} else if (data.name == "set background") {
 			commandChangeBackground($scope.evaluate(data.value));
 		} else if (data.name == "=") {
 			commandAssign(index, data.expression2, data.expression);
 		} else if (data.name == 'play sound') {
 			commandPlaySound($scope.evaluate(data.value));
 		} 
 		SpriteService.updateSpriteList(index, $scope.list[index]);
 	}

 	var commandSetX = function(index, setX) {
		$scope.list[index].x = parseInt(setX);
 	}
	
 	var commandSetY = function(index, setY) {
 		$scope.list[index].y = parseInt(setY);
 	}

 	var commandShow = function(index) {
 		$scope.list[index].show = true;	
 	}

 	var commandHide = function(index) {
	 	$scope.list[index].show = false;
 	}

 	var commandChangeCostume = function(index, value) {
 		if(!(value < SpriteService.getCostumeList().length && value >= 0)) {
 			value = Math.floor(Math.random() * SpriteService.getCostumeList().length);
 		}
 		$scope.list[index].costume = SpriteService.getCostumeList()[value].image; 
 	}

 	var commandPlaySound = function(value) {
 		if(!(value < $scope.sounds.length && value >= 0)) {
	 		value = Math.floor(Math.random() * $scope.sounds.length);
 		}
 		var audio = new Audio($scope.sounds[value].image);
 		audio.play();
 	}

 	var commandAssign = function(index, op1, op2) {
 		var temp = $scope.evaluate(op2, index, false);
 		if (op1 === "posX" || op1 === "positionX") {
 			$scope.list[index].x = temp;
 		} else if (op1 === "posY" || op1 === "positionY") {
 			$scope.list[index].y = temp;
 		} else{
	 		if($scope.varList.indexOf(op1) != -1) {
	 			var i = $scope.varList.indexOf(op1);
	 			$scope.varValue[i] = temp;
	 		} else {
	 			$scope.varList.push(op1);
	 			$scope.varValue.push(temp);
	 		}
 		}
 	}

 	var commandMove = function(index, value, degrees) {
 		$scope.list[index].moving = true;
 		var distance = value * $scope.steps;
 		degrees = (degrees + 180) * -1;
 		var angle = degrees - 360 * Math.floor(degrees/360);
 		var horizontal = Math.floor(Math.sin(angle * (Math.PI / 180)) * distance);
 		var vertical = Math.floor(Math.cos(angle * (Math.PI / 180)) * distance);
 		
 		if($scope.list[index].x === "auto") {
 			$scope.list[index].x = horizontal;
 		} else {
 			$scope.list[index].x = parseInt($scope.list[index].x) + horizontal;
 		}

 		if($scope.list[index].y === "auto") {
 			$scope.list[index].y = vertical;
 		} else {
 			$scope.list[index].y = parseInt($scope.list[index].y) + vertical;
 		}
 	}

 	var commandChangeBackground = function(value) {
 		if(!(value < SpriteService.getBackgroundList().length && value >= 0)) {
 			value = Math.floor(Math.random()*SpriteService.getBackgroundList().length);
 		}
 		SpriteService.updateBackground(value);
 	}

 	var ExpressionLexer = function(expression) {
 		this.Lexemes = expression.split('');
 		this.LexemeTypes = (function(exp){
 			var foo = [];
 			var temp = expression.split('');
 			for(var i = 0; i < temp.length; i++) {
 				if($scope.operators.indexOf(temp[i]) != -1) {
 					foo.push(0);
 				} else if(temp[i] == " ") {
 					foo.push(4);
 				} else if(!isNaN(temp[i])) {
 					foo.push(1);
 				} else if(temp[i] == ".") {
 					foo.push(3);
 				} else if(temp[i] == " ") {
 					foo.push(4);
 				} else if(temp[i] == "_") {
 					foo.push(5);
 				} else if(/^[a-zA-Z]{1}$/.test(temp[i])) {
 					foo.push(6);
 				} else if(temp[i] == "(" || temp[i] == ")") {
 					foo.push(7);
 				} else {
 					foo.push(-1);
 				}
 			}
 			return foo;
 		})(expression);
 		this.index = 0;
 	}
 	//-1: Error
 	// 0: Operators
 	// 1: INTEGER
 	// 2: !
 	// 3: .
 	// 4: WHITESPACE
 	// 5: _
 	// 6: Alphabet
 	// 7: BRACKETS
 	ExpressionLexer.prototype.getNextToken = function() {
 		if(this.index >= this.Lexemes.length) {
 			return "EOL";
 		}
 		while(this.LexemeTypes[this.index] === 4) {
 			this.index++;
 		}
 		var type = this.LexemeTypes[this.index];
 		var current = this.Lexemes[this.index++];
 		switch(type) {
 			case 2: case 7:
 				return current;
 			case 0:
 				if(current === "=") {
 					if(this.Lexemes[this.index] === "=") {
 						this.index++;
 						current += "=";
 					} else {
 						return "ERROR";
 					}
 				}else if(current === "|" || current === "&") {
 					if(this.Lexemes[this.index] === current) {
 						this.index++;
 						current += current;
 					}
 				} else if (current === "<" || current === ">" || current === "!") {
 					if(this.Lexemes[this.index] === "=") {
 						this.index++;
 						current += "=";
 					} else if (current === "!") {
 						while(this.Lexemes[this.index] === "!") {
 							current += this.Lexemes[this.index++];
 						}
 					}
 				} 
 				return current;
 			case 1:
 				while(this.LexemeTypes[this.index] === 1) {
 					current += this.Lexemes[this.index++];
 				}
 				if (this.LexemeTypes[this.index] === ".") {
 					current += "."
 					this.index++;
 					while(this.LexemeTypes[this.index] === 1) {
 						current += this.Lexemes[this.index++];
 					}
 				}
 				return current;
 			case 5: case 6:
 				while(this.LexemeTypes[this.index] === 1 || this.LexemeTypes[this.index] === 5 || this.LexemeTypes[this.index] === 6) {
 					current += this.Lexemes[this.index++];
 				}
 				return current;
 			default:
 				return "ERROR";
 		}
 	}

  });
