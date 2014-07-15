var touchList = function(_obj) {
	
	var container;

	var children = new Array();

	//左右 =1  上下 = 2
	var direction = 0;
	//左 -1 右+1
	var directionLR = 0;
	//左边的滚动数，最高 children.length
	var leftCounts = 1;

	var childW;
	var windowType;

	var moveLeft;

	var initChildW = function() {
		
		var protypes = ["margin", "padding"];
		
		var w = $(children[0]).width();

		protypes.forEach(function(i) {
			var arr = $(children[0]).css(i).split(" ").map(function(i, elem) {
				if (elem == 1 || elem == 3) {
					return Number(i.substring(0, i.length - 2));
				} else {
					return 0;
				}
			});
			if(arr.length==4){
				w = w+arr[1]+arr[3];
			}
			if(arr.length==2){
				w = w + arr[1] * 2;
			}
		});
		return w;
	};
	var getChildes = function() {
		
		if(typeof _obj == "string"){
			if(_obj[0] != "#"){
				_obj = "#" + _obj;
			}
		}
		
		console.info(_obj);
		
		container = $(_obj)[0];

		children = $(container).children();
		//childW = $(container).width() / cn.length;

		//子节点的宽度
		childW = initChildW();

		for (var i = 0; i < children.length; i++) {
			$(children[i]).css("position", "relative");
			children[i].draggable = false;
		};
		
	}();

	var setEvents = function() {

		var evnets;
		var ifDevice = false;
		var eventTypesM = ["mousedown", "mousemove", "mouseup"];
		var eventTypesT = ["touchstart", "touchmove", "touchend"];

		if ("createTouch" in document) {
			events = eventTypesT;
			ifDevice = true;
		} else {
			events = eventTypesM;
			ifDevice = false;
		}
		for (var i = 0; i < events.length; i++) {( function(i) {
					if (i == 2) {
						window["on" + events[i]] = function(e) {
							eventsHandle(i, [0, 0]);
						};
					} else {
						container["on" + events[i]] = function(e) {

							var eventO = ifDevice ? e.touches[0] : e;
							var x = eventO.pageX - $(this).offset().left;
							var y = eventO.pageY - $(this).offset().top;

							if (i == 1) {
								windowType = e.type;
							}

							eventsHandle(i, [x, y]);
						};
					}
				}(i));
		};

		return {
			ifBaneWindow : false,

			onAndOff : function() {

				if (direction == 1 && !this.ifBaneWindow) {

					window["on" + windowType] = function(e) {
						e.preventDefault();
						e.stopPropagation();
					};
					this.ifBaneWindow = true;

					return "bane window";
				}
				if (direction == 2 && this.ifBaneWindow) {
					window["on" + windowType] = function() {
					};

					this.ifBaneWindow = false;

					return "save window";
				};
				return "nothing";
			}
		};
	}();

	var eventsHandle = function() {

		var preLeft;
		var preX;
		var preY;

		var ifDown = false;
		var moveFn = undefined;
		var ifGone = false;

		var ifslide = false;

		var getPreLeft = function() {

			var currentLeft = $(children[0]).css("left");

			if (currentLeft == "auto") {
				return 0;
			} else {
				return Number(currentLeft.substring(0, currentLeft.length - 2));
			}
		};

		var down = function(c) {

			if (!ifDown && !ifslide) {

				preLeft = getPreLeft();

				preX = c[0];
				preY = c[1];

				ifDown = true;
			}
		};
		var move = function(c) {
			if (ifDown && !ifslide) {
				var x = c[0];
				var y = c[1];

				if (!direction) {
					if (Math.abs(x - preX) >= Math.abs(y - preY)) {
						//左右
						direction = 1;
					} else {
						//上下
						direction = 2;
					}
					moveFn = movehandle(direction);
				} else {
					moveFn(c);
				}

				var oor = setEvents.onAndOff();
			}
		};
		var movehandle = function(d) {

			if (d == 1 || d == 2) {

				var vertHandler = function(c) {

					var w = c[0] - preX;

					if (Math.abs(w) > childW * 0.15) {
						directionLR = (w >= 0 ? 1 : -1);
					} else {
						directionLR = 0;
					}

					moveLeft = Math.abs(w);

					for (var i = 0; i < children.length; i++) {
						$(children[i]).css("left", preLeft + w + "px");
					};
				};
				var horiHandler = function(c) {

				};

				var handles = [vertHandler, horiHandler];

				return handles[d - 1];
			} else {
				throw ("not a correct direction in movehandle");
			}
		};
		var up = function(c) {

			if (!ifslide) {

				if (!(directionLR > 0 && leftCounts == 1) && directionLR && direction && !(leftCounts >= children.length && directionLR < 0)) {

					console.log("true");

					ifslide = true;
					var p = slide(directionLR, preLeft);

					p.done(function() {

						if (directionLR > 0) {
							leftCounts--;
						} else {
							leftCounts++;
						}

						preLeft = getPreLeft();

						ifDown = false;
						direction = 0;
						directionLR = 0;
						ifslide = false;
					});

				} else {
					for (var i = 0; i < children.length; i++) {
						$(children[i]).css("left", preLeft + "px");
					};
					ifDown = false;
					direction = 0;
					directionLR = 0;
				}
			}
		};
		var actions = [down, move, up];

		return function(i, coords) {

			if (i >= 0 && i <= 2) {
				actions[i](coords);
				return true;
			} else {

				return false;
			}
		};
	}();
	//滑动的动画过程
	var slide = function(d, pl) {
		// d=1 or d=-1;
		var dfd = new $.Deferred();
		//currentDisplacement  需要滑动的距离
		//currentLeft  元起点   
		//addupLeft    已经滑动的距离
		var cdp = ( childW - moveLeft ) * d;
		var cl = pl;
		var al = cl + moveLeft * d;

		var speed = 45;

		var c = 2;
		var rate = Math.pow(c, 6);

		function go() {
			
				if (c == rate) {

					for (var i = 0; i < children.length; i++) {
						$(children[i]).css("left", (cl + childW * d) + "px");
					};

					dfd.resolve();

				} else {

					al = cdp / c + al;

					for (var i = 0; i < children.length; i++) {
						$(children[i]).css("left", al + "px");
					};
					c = c * 2;
					setTimeout(go, speed);
				}
		};
		setTimeout(go, speed);

		return dfd.promise();
	};
};
