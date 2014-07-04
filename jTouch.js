( function(container) {

		var children = new Array();

		//左右 =1  上下 = 2
		var direction = 0;
		//左 -1 右+1
		var directionLR = 0;
		//左边的滚动数，最高 children.length
		var leftCounts = 1;

		var childW;
		var windowType;

		var theLeft;

		var getChildes = function() {

			var cn = $(container).children();
			childW = $(container).width() / cn.length;
			for (var i = 0; i < cn.length; i++) {
				children[i] = cn[i];
				$(cn[i]).css("position", "relative").width(childW + "px");
			};
			$("#cw").text(childW + "px");
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
								
								if(ifDevice){
									$("#cl").text(e.touches.length);
								}
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
							$("#s").text("水平");
						} else {
							//上下
							direction = 2;
							$("#s").text("垂直");
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

						$("#cx").text(Math.abs(w));
						$("#cy").text(childW * 0.2);
						if (Math.abs(w) > childW * 0.15) {
							directionLR = (w >= 0 ? 1 : -1);
						} else {
							directionLR = 0;
						}

						theLeft = Math.abs(w);

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

						ifslide = true;
						var p = slide(directionLR, preLeft);

						p.done(function() {

							$("#d").text(directionLR);
							if (directionLR > 0) {
								leftCounts--;
							} else {
								leftCounts++;
							}
							$("#c").text(leftCounts);

							preLeft = getPreLeft();

							ifDown = false;
							direction = 0;
							directionLR = 0;
							ifslide = false;
						});

					} else {
						console.log("up else");
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
			//currentDisplacement  currentLeft addupLeft
			var cdp = childW * d;
			var cl = pl;
			var al = cl;

			var speed = 45;

			var c = 2;
			var rate = Math.pow(c, 6);

			function go() {
				if (theLeft / childW <= 0.5) {

					if (c == rate) {

						for (var i = 0; i < children.length; i++) {
							$(children[i]).css("left", (cl + cdp) + "px");
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
				} else {
					for (var i = 0; i < children.length; i++) {
						$(children[i]).css("left", (cl + cdp) + "px");
					};

					dfd.resolve();
				}
			};
			setTimeout(go, speed);

			return dfd.promise();
		};
	}($("#boxes")[0]));
